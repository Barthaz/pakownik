import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faUsers,
  faShareNodes,
  faTrash,
  faPlus,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import type { ListsStackParamList, ListShare, PackingList, SharePermission } from '@/models/types';
import { packingListService } from '@/services/packingListService';
import { listShareService } from '@/services/listShareService';
import { familyService } from '@/services/familyService';
import { isSessionExpiredError } from '@/services/apiClient';
import { calculateProgress } from '@/models/progress';
import { Screen } from '@/components/Screen';
import { ProgressBar } from '@/components/ProgressBar';
import { PackingListItems } from '@/components/PackingListItems';
import { AppModal } from '@/components/AppModal';
import { AddItemForm } from '@/components/AddItemForm';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SHARE_PERMISSION_LABELS } from '@/models/constants';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<ListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const [list, setList] = useState<PackingList | null>(null);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [shares, setShares] = useState<ListShare[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>('checkoff');
  const [sharing, setSharing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [listData, membersData] = await Promise.all([
        packingListService.getById(listId),
        familyService.getAll(),
      ]);
      setList(listData);
      setMembers(membersData.map((m) => ({ id: m.id, name: m.name })));
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
      navigation.goBack();
    }
  }, [listId, navigation]);

  const loadShares = useCallback(async () => {
    try {
      const data = await listShareService.getShares(listId);
      setShares(data);
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  }, [listId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const isOwner = list?.ownership !== 'shared';
  const canCheck = isOwner || list?.myPermission !== 'readonly';
  const canEdit = isOwner || list?.myPermission === 'full_edit';
  const canAddItems = canEdit;

  const openShareModal = () => {
    setShowShare(true);
    void loadShares();
  };

  if (!list) {
    return (
      <Screen>
        <Text style={styles.loading}>{pl.common.loading}</Text>
      </Screen>
    );
  }

  const progress = calculateProgress(list.items ?? []);
  const availableMembers = members.filter((m) => !list.selectedMemberIds.includes(m.id));

  const handleToggle = async (itemId: string) => {
    const item = list.items?.find((i) => i.id === itemId);
    if (!item) return;
    try {
      const updated = await packingListService.updateItem(listId, itemId, { packed: !item.packed });
      setList((prev) =>
        prev ? { ...prev, items: prev.items?.map((i) => (i.id === itemId ? updated : i)) } : prev,
      );
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleUpdate = async (itemId: string, data: { name?: string; quantity?: number }) => {
    try {
      const updated = await packingListService.updateItem(listId, itemId, data);
      setList((prev) =>
        prev ? { ...prev, items: prev.items?.map((i) => (i.id === itemId ? updated : i)) } : prev,
      );
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleDelete = (itemId: string) => {
    Alert.alert(pl.form.delete, 'Usunąć tę pozycję?', [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await packingListService.deleteItem(listId, itemId);
          setList((prev) =>
            prev ? { ...prev, items: prev.items?.filter((i) => i.id !== itemId) } : prev,
          );
        },
      },
    ]);
  };

  const handleAddItem = async (data: { category: string; name: string; quantity: number }) => {
    try {
      const item = await packingListService.createItem(listId, data);
      setList((prev) => (prev ? { ...prev, items: [...(prev.items ?? []), item] } : prev));
      setShowAdd(false);
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    setSharing(true);
    try {
      await listShareService.createShare(listId, {
        email: shareEmail.trim(),
        permission: sharePermission,
      });
      setShareEmail('');
      await loadShares();
      Alert.alert(pl.lists.share, 'Lista udostępniona');
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShare = (shareId: string) => {
    Alert.alert(pl.lists.shareRevoke, 'Cofnąć dostęp?', [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await listShareService.deleteShare(listId, shareId);
          await loadShares();
        },
      },
    ]);
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    try {
      const updated = await packingListService.addMembers(listId, selectedMembers);
      setList(updated);
      setShowMembers(false);
      setSelectedMembers([]);
    } catch (e) {
      if (isSessionExpiredError(e)) return;
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleDeleteList = () => {
    Alert.alert(pl.lists.delete, pl.lists.deleteConfirm, [
      { text: pl.form.cancel, style: 'cancel' },
      {
        text: pl.form.delete,
        style: 'destructive',
        onPress: async () => {
          await packingListService.delete(listId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <FontAwesomeIcon icon={faChevronLeft} size={16} color={colors.navy} />
          <Text style={styles.backText}>{pl.common.back}</Text>
        </TouchableOpacity>
        <View style={styles.topActions}>
          {isOwner && availableMembers.length > 0 && (
            <TouchableOpacity onPress={() => setShowMembers(true)} hitSlop={8}>
              <FontAwesomeIcon icon={faUsers} size={20} color={colors.navy} />
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity onPress={openShareModal} hitSlop={8}>
              <FontAwesomeIcon icon={faShareNodes} size={20} color={colors.navy} />
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity onPress={handleDeleteList} hitSlop={8}>
              <FontAwesomeIcon icon={faTrash} size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isOwner && list.sharedByEmail && (
        <View style={styles.sharedBanner}>
          <Text style={styles.sharedBannerText}>
            {pl.lists.sharedBadge} · {pl.lists.sharedFrom} {list.sharedByEmail}
          </Text>
        </View>
      )}

      <Text style={styles.title}>{list.name}</Text>
      <ProgressBar progress={progress} />

      <PackingListItems
        items={list.items ?? []}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        canCheck={canCheck}
        canEdit={canEdit}
      />

      {canAddItems && (
        <TouchableOpacity style={styles.addFab} onPress={() => setShowAdd(true)} activeOpacity={0.9}>
          <FontAwesomeIcon icon={faPlus} size={24} color={colors.white} />
        </TouchableOpacity>
      )}

      <AppModal visible={showAdd} title={pl.lists.addItem} onClose={() => setShowAdd(false)}>
        <AddItemForm onSubmit={handleAddItem} onCancel={() => setShowAdd(false)} />
      </AppModal>

      <AppModal visible={showShare} title={pl.lists.share} onClose={() => setShowShare(false)}>
        <Input
          label={pl.lists.shareEmail}
          value={shareEmail}
          onChangeText={setShareEmail}
          placeholder={pl.lists.shareEmailPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.shareLabel}>{pl.lists.sharePermission}</Text>
        {(['readonly', 'checkoff', 'full_edit'] as SharePermission[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.permRow, sharePermission === p && styles.permRowOn]}
            onPress={() => setSharePermission(p)}
          >
            <Text style={styles.permText}>{SHARE_PERMISSION_LABELS[p]}</Text>
            {sharePermission === p && (
              <FontAwesomeIcon icon={faCircleCheck} size={20} color={colors.coral} />
            )}
          </TouchableOpacity>
        ))}
        <Button
          title={pl.lists.shareAdd}
          onPress={handleShare}
          loading={sharing}
          style={{ marginTop: spacing.md }}
        />

        {shares.length > 0 && (
          <View style={styles.shareList}>
            <Text style={styles.shareLabel}>{pl.lists.shareList}</Text>
            <ScrollView style={{ maxHeight: 160 }}>
              {shares.map((share) => (
                <View key={share.id} style={styles.shareRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shareEmail}>{share.sharedWithEmail}</Text>
                    <Text style={styles.sharePerm}>{SHARE_PERMISSION_LABELS[share.permission]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRevokeShare(share.id)} hitSlop={8}>
                    <FontAwesomeIcon icon={faTrash} size={16} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </AppModal>

      <AppModal visible={showMembers} title={pl.lists.addMembers} onClose={() => setShowMembers(false)}>
        <View style={styles.chips}>
          {availableMembers.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedMembers.includes(m.id) && styles.chipOn]}
              onPress={() =>
                setSelectedMembers((prev) =>
                  prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                )
              }
            >
              <Text style={[styles.chipText, selectedMembers.includes(m.id) && styles.chipTextOn]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title={pl.form.save} onPress={handleAddMembers} style={{ marginTop: spacing.md }} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 80 },
  loading: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: {
    fontFamily: fonts.bodyMedium,
    color: colors.navy,
    fontSize: 16,
  },
  topActions: { flexDirection: 'row', gap: spacing.md },
  sharedBanner: {
    backgroundColor: 'rgba(232,168,124,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,168,124,0.35)',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sharedBannerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navy,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  addFab: {
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
  shareLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  permRowOn: { borderColor: colors.coral, backgroundColor: 'rgba(232,168,124,0.1)' },
  permText: {
    fontFamily: fonts.body,
    color: colors.navy,
    fontSize: 15,
  },
  shareList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  shareRow: {
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
  shareEmail: {
    fontFamily: fonts.bodyMedium,
    color: colors.navy,
    fontSize: 14,
  },
  sharePerm: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
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
  },
  chipTextOn: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemi,
  },
});
