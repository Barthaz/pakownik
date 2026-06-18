import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { filterItemSuggestions, type ItemSuggestion } from '@/models/itemSuggestions';
import { pl } from '@/models/pl';
import { colors, fonts, radius, spacing } from '@/theme';

interface ItemNameAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: ItemSuggestion) => void;
  suggestions: ItemSuggestion[];
  placeholder?: string;
}

export function ItemNameAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
}: ItemNameAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const matches = filterItemSuggestions(suggestions, value);
  const showList = focused && value.trim().length > 0 && matches.length > 0;

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        autoCapitalize="sentences"
      />
      {showList && (
        <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {matches.map((suggestion) => (
            <TouchableOpacity
              key={`${suggestion.category}-${suggestion.name}`}
              style={styles.row}
              onPress={() => onSelect(suggestion)}
            >
              <Text style={styles.name}>{suggestion.name}</Text>
              <Text style={styles.category}>{suggestion.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {suggestions.length > 0 && !showList && value.trim().length === 0 && (
        <Text style={styles.hint}>{pl.form.itemSuggestionsHint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
  },
  list: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.navy,
  },
  category: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
