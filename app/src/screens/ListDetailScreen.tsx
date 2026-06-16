import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import * as Clipboard from 'expo-clipboard';
import type { ListsStackParamList, PackingList, SharePermission } from '@/models/types';
import { packingListService } from '@/services/packingListService';
import { familyService } from '@/services/familyService';
import { calculateProgress } from '@/models/progress';
import { Screen } from '@/components/Screen';
import { ProgressBar } from '@/components/ProgressBar';
import { PackingListItems } from '@/components/PackingListItems';
import { AppModal } from '@/components/AppModal';
import { AddItemForm } from '@/components/AddItemForm';
import { Button } from '@/components/Button';
import { SHARE_PERMISSION_LABELS } from '@/models/constants';
import { pl } from '@/models/pl';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = NativeStackScreenProps<ListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const [list, setList] = useState<PackingList | null>(null);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [listData, membersData] = await Promise.all([
        packingListService.getById(listId),
        familyService.getAll(),
      ]);
      setList(listData);
      setMembers(membersData.map((m) => ({ id: m.id, name: m.name })));
    } catch (e) {
      Alert.alert(pl.common.error, (e as Error).message);
      navigation.goBack();
    }
  }, [listId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!list) {
    return (
      <Screen>
        <Text style={styles.loading}>{pl.common.loading}</Text>
      </Screen>
    );
  }

  const progress = calculateProgress(list.items ?? []);
  const shareBase = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:5173';
  const shareUrl = `${shareBase}/share/${list.shareId}`;
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
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleCopyShare = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert(pl.lists.copied);
  };

  const handlePermission = async (sharePermission: SharePermission) => {
    try {
      const updated = await packingListService.update(listId, { sharePermission });
      setList(updated);
    } catch (e) {
      Alert.alert(pl.common.error, (e as Error).message);
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    try {
      const updated = await packingListService.addMembers(listId, selectedMembers);
      setList(updated);
      setShowMembers(false);
      setSelectedMembers([]);
    } catch (e) {
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
          {availableMembers.length > 0 && (
            <TouchableOpacity onPress={() => setShowMembers(true)} hitSlop={8}>
              <FontAwesomeIcon icon={faUsers} size={20} color={colors.navy} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowShare(true)} hitSlop={8}>
            <FontAwesomeIcon icon={faShareNodes} size={20} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteList} hitSlop={8}>
            <FontAwesomeIcon icon={faTrash} size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{list.name}</Text>
      <ProgressBar progress={progress} />

      <PackingListItems
        items={list.items ?? []}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <TouchableOpacity style={styles.addFab} onPress={() => setShowAdd(true)} activeOpacity={0.9}>
        <FontAwesomeIcon icon={faPlus} size={24} color={colors.white} />
      </TouchableOpacity>

      <AppModal visible={showAdd} title={pl.lists.addItem} onClose={() => setShowAdd(false)}>
        <AddItemForm onSubmit={handleAddItem} onCancel={() => setShowAdd(false)} />
      </AppModal>

      <AppModal visible={showShare} title={pl.lists.share} onClose={() => setShowShare(false)}>
        <Text style={styles.shareLabel}>{pl.lists.shareLink}</Text>
        <Text style={styles.shareUrl} selectable>
          {shareUrl}
        </Text>
        <Button title="Kopiuj link" onPress={handleCopyShare} style={{ marginBottom: spacing.md }} />
        <Text style={styles.shareLabel}>{pl.lists.sharePermission}</Text>
        {(['readonly', 'checkoff', 'full_edit'] as SharePermission[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.permRow, list.sharePermission === p && styles.permRowOn]}
            onPress={() => handlePermission(p)}
          >
            <Text style={styles.permText}>{SHARE_PERMISSION_LABELS[p]}</Text>
            {list.sharePermission === p && (
              <FontAwesomeIcon icon={faCircleCheck} size={20} color={colors.coral} />
            )}
          </TouchableOpacity>
        ))}
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
  },
  shareUrl: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
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
