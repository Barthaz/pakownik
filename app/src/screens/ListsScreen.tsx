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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { FamilyMember, ItemsByMember, ListsStackParamList, PackingList } from '@/models/types';
import { packingListService } from '@/services/packingListService';
import { familyService } from '@/services/familyService';
import { useAuth } from '@/contexts/AuthContext';
import { isSessionExpiredError } from '@/services/apiClient';
import { calculateProgress } from '@/models/progress';
import { Screen } from '@/components/Screen';
import { AppNameLogo } from '@/components/AppNameLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AppModal } from '@/components/AppModal';
import { MemberItemsPickModal } from '@/components/MemberItemsPickModal';
import { FamilyMemberSelectChip } from '@/components/FamilyMemberSelectChip';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<ListsStackParamList, 'Lists'>;

export function ListsScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [lists, setLists] = useState<PackingList[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [pickQueue, setPickQueue] = useState<FamilyMember[]>([]);
  const [itemsByMember, setItemsByMember] = useState<ItemsByMember>({});
  const [pendingCreateName, setPendingCreateName] = useState('');

  const load = useCallback(async () => {
    try {
      const [listsData, membersData] = await Promise.all([
        packingListService.getAll(),
        familyService.getAll(),
      ]);
      setLists(listsData);
      setMembers(membersData);
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

  const resetCreateState = () => {
    setShowCreate(false);
    setNewName('');
    setSelectedMembers([]);
    setPickQueue([]);
    setItemsByMember({});
    setPendingCreateName('');
  };

  const finishCreate = async (name: string, memberIds: string[], selections: ItemsByMember) => {
    setCreating(true);
    try {
      const list = await packingListService.create(name, memberIds, selections);
      resetCreateState();
      navigation.navigate('ListDetail', { listId: list.id });
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    if (selectedMembers.length === 0) {
      await finishCreate(newName.trim(), [], {});
      return;
    }

    const selected = selectedMembers
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is FamilyMember => m !== undefined);
    const withoutItems = selected.filter((m) => (m.items ?? []).length === 0);
    const withItems = selected.filter((m) => (m.items ?? []).length > 0);
    const initialSelections = Object.fromEntries(withoutItems.map((m) => [m.id, []]));

    if (withItems.length === 0) {
      await finishCreate(newName.trim(), selectedMembers, initialSelections);
      return;
    }

    setPendingCreateName(newName.trim());
    setItemsByMember(initialSelections);
    setPickQueue(withItems);
    setShowCreate(false);
  };

  const handlePickConfirm = async (selectedItemIds: string[]) => {
    const current = pickQueue[0];
    if (!current) return;

    const nextSelections = { ...itemsByMember, [current.id]: selectedItemIds };
    const rest = pickQueue.slice(1);

    if (rest.length === 0) {
      await finishCreate(pendingCreateName, selectedMembers, nextSelections);
      return;
    }

    setItemsByMember(nextSelections);
    setPickQueue(rest);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
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
        <Text style={styles.title}>{pl.lists.title}</Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.coral} />}
        contentContainerStyle={lists.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{pl.lists.empty}</Text>
              <Button title={pl.lists.new} onPress={() => setShowCreate(true)} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const progress = calculateProgress(item.items ?? []);
          const isShared = item.ownership === 'shared';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              {isShared && item.sharedByEmail && (
                <Text style={styles.sharedMeta}>
                  {pl.lists.sharedBadge} · {pl.lists.sharedFrom} {item.sharedByEmail}
                </Text>
              )}
              <View style={styles.track}>
                <LinearGradient
                  colors={[colors.sand, colors.coral]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${progress.percent}%` }]}
                />
              </View>
              <Text style={styles.cardMeta}>
                {progress.percent}% · {progress.packedQuantity}/{progress.totalQuantity} {pl.lists.pieces}
              </Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)} activeOpacity={0.9}>
        <FontAwesomeIcon icon={faPlus} size={22} color={colors.white} />
      </TouchableOpacity>

      <AppModal visible={showCreate} title={pl.lists.new} onClose={() => setShowCreate(false)}>
        <Input
          label={pl.form.name}
          value={newName}
          onChangeText={setNewName}
          placeholder="np. Wakacje nad morzem"
        />
        {members.length > 0 && (
          <View style={styles.members}>
            <Text style={styles.membersLabel}>{pl.lists.addMembers}</Text>
            <View style={styles.chips}>
              {members.map((m) => (
                <FamilyMemberSelectChip
                  key={m.id}
                  member={m}
                  selected={selectedMembers.includes(m.id)}
                  onPress={() => toggleMember(m.id)}
                />
              ))}
            </View>
          </View>
        )}
        <Button title={pl.form.save} onPress={handleCreate} loading={creating} style={{ marginTop: spacing.md }} />
      </AppModal>

      <MemberItemsPickModal
        visible={pickQueue.length > 0}
        memberName={pickQueue[0]?.name ?? ''}
        items={pickQueue[0]?.items ?? []}
        submitting={creating}
        onClose={() => {
          setPickQueue([]);
          setItemsByMember({});
          setPendingCreateName('');
        }}
        onConfirm={(selectedItemIds) => void handlePickConfirm(selectedItemIds)}
      />
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  sharedMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
    marginBottom: spacing.sm,
  },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
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
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  members: { marginTop: spacing.md },
  membersLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: 'rgba(232,168,124,0.15)', borderColor: colors.coral },
  chipText: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
  },
  chipTextOn: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemi,
  },
});
