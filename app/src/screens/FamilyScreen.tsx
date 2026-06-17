import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUserPlus,
  faTrash,
  faCirclePlus,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { FamilyMember } from '@/models/types';
import { familyService } from '@/services/familyService';
import { isSessionExpiredError } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Screen } from '@/components/Screen';
import { AppNameLogo } from '@/components/AppNameLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AppModal } from '@/components/AppModal';
import { AddItemForm } from '@/components/AddItemForm';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export function FamilyScreen() {
  const { logout } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [addItemMemberId, setAddItemMemberId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMembers(await familyService.getAll());
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const handleCreateMember = async () => {
    if (!newName.trim()) return;
    try {
      await familyService.create(newName.trim());
      setShowAddMember(false);
      setNewName('');
      load();
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleDeleteMember = (id: string) => {
    Alert.alert(pl.family.deleteMember, pl.family.deleteMemberConfirm, [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await familyService.delete(id);
          load();
        },
      },
    ]);
  };

  const handleAddItem = async (data: { category: string; name: string; quantity: number }) => {
    if (!addItemMemberId) return;
    try {
      await familyService.createItem(addItemMemberId, data);
      setAddItemMemberId(null);
      load();
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleDeleteItem = (memberId: string, itemId: string) => {
    Alert.alert(pl.form.delete, 'Usunąć tę rzecz?', [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await familyService.deleteItem(memberId, itemId);
          load();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppNameLogo />
          <TouchableOpacity onPress={logout} hitSlop={8}>
            <Text style={styles.logout}>{pl.auth.logout}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{pl.family.title}</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.coral} />}
        contentContainerStyle={members.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{pl.family.empty}</Text>
              <Button title={pl.family.add} onPress={() => setShowAddMember(true)} />
            </View>
          ) : null
        }
        ListHeaderComponent={
          members.length > 0 ? (
            <TouchableOpacity style={styles.addRow} onPress={() => setShowAddMember(true)}>
              <FontAwesomeIcon icon={faUserPlus} size={18} color={colors.coral} />
              <Text style={styles.addRowText}>{pl.family.add}</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.memberName}>{item.name}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => setAddItemMemberId(item.id)} hitSlop={8}>
                  <FontAwesomeIcon icon={faCirclePlus} size={22} color={colors.coral} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMember(item.id)} hitSlop={8}>
                  <FontAwesomeIcon icon={faTrash} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>
            {(item.items ?? []).length === 0 ? (
              <Text style={styles.noItems}>Brak przypisanych rzeczy</Text>
            ) : (
              (item.items ?? []).map((fi) => (
                <View key={fi.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{fi.name}</Text>
                    <Text style={styles.itemCat}>{fi.category}</Text>
                  </View>
                  <Text style={styles.itemQty}>×{fi.quantity}</Text>
                  <TouchableOpacity onPress={() => handleDeleteItem(item.id, fi.id)} hitSlop={8}>
                    <FontAwesomeIcon icon={faCircleXmark} size={18} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />

      <AppModal visible={showAddMember} title={pl.family.add} onClose={() => setShowAddMember(false)}>
        <Input label={pl.form.name} value={newName} onChangeText={setNewName} placeholder="np. Anna" />
        <Button title={pl.form.save} onPress={handleCreateMember} style={{ marginTop: spacing.md }} />
      </AppModal>

      <AppModal
        visible={!!addItemMemberId}
        title={pl.family.addItem}
        onClose={() => setAddItemMemberId(null)}
      >
        <AddItemForm onSubmit={handleAddItem} onCancel={() => setAddItemMemberId(null)} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logout: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.navy,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  addRowText: {
    color: colors.coral,
    fontFamily: fonts.bodySemi,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.navy,
  },
  cardActions: { flexDirection: 'row', gap: spacing.md },
  noItems: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontFamily: fonts.bodyMedium,
    color: colors.navy,
    fontSize: 15,
  },
  itemCat: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  itemQty: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
  },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
