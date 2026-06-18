import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DEFAULT_CATEGORIES } from '@/models/constants';
import { collectItemSuggestions, type ItemSuggestion } from '@/models/itemSuggestions';
import { Input } from './Input';
import { ItemNameAutocomplete } from './ItemNameAutocomplete';
import { Button } from './Button';
import { pl } from '@/models/pl';
import { spacing } from '@/theme';

interface SuggestionMember {
  id: string;
  items?: { name: string; category: string }[];
}

interface AddItemFormProps {
  onSubmit: (data: { category: string; name: string; quantity: number }) => void;
  onCancel: () => void;
  members?: SuggestionMember[];
  excludeMemberId?: string | null;
}

export function AddItemForm({
  onSubmit,
  onCancel,
  members = [],
  excludeMemberId = null,
}: AddItemFormProps) {
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const suggestions = useMemo(
    () => collectItemSuggestions(members, excludeMemberId),
    [members, excludeMemberId],
  );

  useEffect(() => {
    setCategory(DEFAULT_CATEGORIES[0]);
    setName('');
    setQuantity('1');
  }, [excludeMemberId]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      category,
      name: name.trim(),
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
    });
    setName('');
    setQuantity('1');
  };

  const handleSuggestionSelect = (suggestion: ItemSuggestion) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{pl.form.category}</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {DEFAULT_CATEGORIES.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>
      {suggestions.length > 0 ? (
        <ItemNameAutocomplete
          label={pl.form.name}
          value={name}
          onChange={setName}
          onSelect={handleSuggestionSelect}
          suggestions={suggestions}
          placeholder="np. Koszulka"
        />
      ) : (
        <Input label={pl.form.name} value={name} onChangeText={setName} placeholder="np. Koszulka" />
      )}
      <Input
        label={pl.form.quantity}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
      />
      <View style={styles.actions}>
        <Button title={pl.form.cancel} variant="ghost" onPress={onCancel} style={styles.btn} />
        <Button title={pl.form.save} onPress={handleSubmit} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  label: { fontSize: 14, fontWeight: '500', color: '#1E3A5F' },
  pickerWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1 },
});
