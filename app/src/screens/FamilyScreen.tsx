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
  faShareNodes,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import type { FamilyMember, FamilyMemberShare } from '@/models/types';
import { familyService } from '@/services/familyService';
import { familyShareService } from '@/services/familyShareService';
import { isSessionExpiredError } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Screen } from '@/components/Screen';
import { AppNameLogo } from '@/components/AppNameLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AppModal } from '@/components/AppModal';
import { AddItemForm } from '@/components/AddItemForm';
import { pl } from '@/models/pl';
import { getMemberItemStats } from '@/models/familyMemberStats';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export function FamilyScreen() {
  const { logout } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newName, setNewName] = useState('');
  const [addItemMemberId, setAddItemMemberId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedShareMembers, setSelectedShareMembers] = useState<string[]>([]);
  const [shares, setShares] = useState<FamilyMemberShare[]>([]);
  const [sharing, setSharing] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const ownedMembers = members.filter((m) => m.ownership !== 'shared');

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

  const loadShares = useCallback(async () => {
    try {
      setShares(await familyShareService.getShares());
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  }, []);

  const openShareModal = () => {
    setShowShare(true);
    setSelectedShareMembers([]);
    void loadShares();
  };

  const handleShare = async () => {
    if (!shareEmail.trim() || selectedShareMembers.length === 0) return;
    setSharing(true);
    try {
      await familyShareService.createShares({
        memberIds: selectedShareMembers,
        email: shareEmail.trim(),
        permission: 'full_edit',
      });
      setShareEmail('');
      setSelectedShareMembers([]);
      await loadShares();
      Alert.alert(pl.family.share, 'Profile udostępnione');
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = (shareId: string) => {
    Alert.alert(pl.family.shareRevoke, 'Cofnąć dostęp?', [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await familyShareService.deleteShare(shareId);
          await loadShares();
        },
      },
    ]);
  };

  const canEditMember = (member: FamilyMember) =>
    member.ownership !== 'shared' || member.myPermission === 'full_edit';

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
        {ownedMembers.length > 0 && (
          <TouchableOpacity style={styles.shareRow} onPress={openShareModal}>
            <FontAwesomeIcon icon={faShareNodes} size={18} color={colors.coral} />
            <Text style={styles.addRowText}>{pl.family.share}</Text>
          </TouchableOpacity>
        )}
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
        renderItem={({ item }) => {
          const isShared = item.ownership === 'shared';
          const canEdit = canEditMember(item);
          const memberItems = item.items ?? [];
          const { positions, totalQuantity } = getMemberItemStats(memberItems);
          const isCollapsed = collapsed[item.id];
          const statsLabel =
            positions === 0
              ? 'Brak rzeczy'
              : `${positions} ${pl.lists.items} · ${totalQuantity} ${pl.lists.pieces}`;

          return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.cardHeaderToggle}
                onPress={() => setCollapsed((c) => ({ ...c, [item.id]: !c[item.id] }))}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon
                  icon={isCollapsed ? faChevronRight : faChevronDown}
                  size={14}
                  color={colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  {isShared && item.sharedByEmail && (
                    <Text style={styles.sharedMeta}>
                      {pl.family.sharedBadge} · {pl.family.sharedFrom} {item.sharedByEmail}
                    </Text>
                  )}
                  <Text style={styles.itemStats}>{statsLabel}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                {canEdit && (
                  <TouchableOpacity onPress={() => setAddItemMemberId(item.id)} hitSlop={8}>
                    <FontAwesomeIcon icon={faCirclePlus} size={22} color={colors.coral} />
                  </TouchableOpacity>
                )}
                {!isShared && (
                  <TouchableOpacity onPress={() => handleDeleteMember(item.id)} hitSlop={8}>
                    <FontAwesomeIcon icon={faTrash} size={18} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {!isCollapsed && (
              <>
            {!canEdit && <Text style={styles.readonly}>{pl.family.sharedReadonly}</Text>}
            {memberItems.length === 0 ? (
              <Text style={styles.noItems}>Brak przypisanych rzeczy</Text>
            ) : (
              memberItems.map((fi) => (
                <View key={fi.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{fi.name}</Text>
                    <Text style={styles.itemCat}>{fi.category}</Text>
                  </View>
                  <Text style={styles.itemQty}>×{fi.quantity}</Text>
                  {canEdit && (
                    <TouchableOpacity onPress={() => handleDeleteItem(item.id, fi.id)} hitSlop={8}>
                      <FontAwesomeIcon icon={faCircleXmark} size={18} color={colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
              </>
            )}
          </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />

      <AppModal visible={showAddMember} title={pl.family.add} onClose={() => setShowAddMember(false)}>
        <Input label={pl.form.name} value={newName} onChangeText={setNewName} placeholder="np. Anna" />
        <Button title={pl.form.save} onPress={handleCreateMember} style={{ marginTop: spacing.md }} />
      </AppModal>

      <AppModal visible={showShare} title={pl.family.share} onClose={() => setShowShare(false)}>
        <Text style={styles.shareLabel}>{pl.family.shareSelectMembers}</Text>
        <View style={styles.chips}>
          {ownedMembers.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedShareMembers.includes(m.id) && styles.chipOn]}
              onPress={() =>
                setSelectedShareMembers((prev) =>
                  prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                )
              }
            >
              <Text style={[styles.chipText, selectedShareMembers.includes(m.id) && styles.chipTextOn]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input
          label={pl.family.shareEmail}
          value={shareEmail}
          onChangeText={setShareEmail}
          placeholder={pl.family.shareEmailPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button
          title={pl.family.shareAdd}
          onPress={handleShare}
          loading={sharing}
          style={{ marginTop: spacing.md }}
        />
        {shares.length > 0 && (
          <View style={styles.shareList}>
            <Text style={styles.shareLabel}>{pl.family.shareList}</Text>
            {shares.map((share) => (
              <View key={share.id} style={styles.shareRowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareMember}>{share.familyMemberName}</Text>
                  <Text style={styles.shareEmailText}>{share.sharedWithEmail}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRevokeShare(share.id)} hitSlop={8}>
                  <FontAwesomeIcon icon={faTrash} size={16} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sharedMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  readonly: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  shareLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: 'rgba(232,168,124,0.15)', borderColor: colors.coral },
  chipText: { fontFamily: fonts.body, color: colors.muted },
  chipTextOn: { color: colors.coralDark, fontFamily: fonts.bodySemi },
  shareList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  shareRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.cream,
  },
  shareMember: {
    fontFamily: fonts.bodyMedium,
    color: colors.navy,
    fontSize: 14,
  },
  shareEmailText: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
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
  cardHeaderToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  memberName: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.navy,
  },
  itemStats: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
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
