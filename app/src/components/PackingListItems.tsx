import { View, Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ListItem } from '@/models/types';
import { getItemMemberLabel } from '@/models/itemAttribution';
import { groupByCategory } from '@/models/progress';
import { InlineName, QuantityStepper } from './ListItemRow';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

interface PackingListItemsProps {
  items: ListItem[];
  memberNames?: Record<string, string>;
  onToggle: (id: string) => void;
  onUpdate: (id: string, data: { name?: string; quantity?: number }) => void;
  onDelete?: (id: string) => void;
  canCheck?: boolean;
  canEdit?: boolean;
}

export function PackingListItems({
  items,
  memberNames = {},
  onToggle,
  onUpdate,
  onDelete,
  canCheck = true,
  canEdit = true,
}: PackingListItemsProps) {
  const grouped = groupByCategory(items);
  const sections = Object.keys(grouped)
    .sort()
    .map((title) => ({ title, data: grouped[title] }));

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.empty}>Brak pozycji. Dodaj pierwszą rzecz do spakowania.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text style={styles.category}>{section.title}</Text>
      )}
      renderItem={({ item, section }) => {
        const memberLabel = getItemMemberLabel(item, section.data, memberNames);

        return (
        <View style={[styles.row, item.packed && styles.rowPacked]}>
          <TouchableOpacity
            style={[styles.check, item.packed && styles.checkOn, !canCheck && styles.checkDisabled]}
            onPress={() => canCheck && onToggle(item.id)}
            disabled={!canCheck}
          >
            {item.packed && <FontAwesomeIcon icon={faCheck} size={12} color={colors.white} />}
          </TouchableOpacity>
          <InlineName
            value={item.name}
            packed={item.packed}
            subtitle={memberLabel}
            onSave={(name) => canEdit && onUpdate(item.id, { name })}
            editable={canEdit}
          />
          <QuantityStepper
            quantity={item.quantity}
            onChange={(quantity) => canEdit && onUpdate(item.id, { quantity })}
            disabled={!canEdit}
          />
          {onDelete && canEdit && (
            <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8}>
              <FontAwesomeIcon icon={faTrash} size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xl },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.sm,
  },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.muted,
  },
  category: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionGap: { height: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  rowPacked: { opacity: 0.75 },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.coral, borderColor: colors.coral },
  checkDisabled: { opacity: 0.5 },
  sep: { height: spacing.sm },
});
