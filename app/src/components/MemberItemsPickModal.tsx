import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import type { FamilyMemberItem } from '@/models/types';
import { pl } from '@/models/pl';
import { AppModal } from '@/components/AppModal';
import { Button } from '@/components/Button';
import { colors, fonts, radius, spacing } from '@/theme';

interface MemberItemsPickModalProps {
  visible: boolean;
  memberName: string;
  items: FamilyMemberItem[];
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (selectedItemIds: string[]) => void;
}

export function MemberItemsPickModal({
  visible,
  memberName,
  items,
  submitting = false,
  onClose,
  onConfirm,
}: MemberItemsPickModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  }, [visible, items]);

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const title = `${pl.lists.pickMemberItemsTitle} ${pl.lists.pickMemberItemsFor} ${memberName}`;

  return (
    <AppModal visible={visible} title={title} onClose={onClose}>
      <Text style={styles.hint}>{pl.lists.pickMemberItemsHint}</Text>

      <ScrollView style={styles.list} nestedScrollEnabled>
        {items.map((item) => {
          const checked = selectedIds.has(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.row}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                {checked && <FontAwesomeIcon icon={faCheck} size={10} color={colors.white} />}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCat}>{item.category}</Text>
              </View>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <Button title={pl.form.cancel} variant="ghost" onPress={onClose} disabled={submitting} />
        <Button
          title={submitting ? pl.common.loading : pl.lists.pickMemberItemsConfirm}
          onPress={() => onConfirm([...selectedIds])}
          loading={submitting}
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
