import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { colors, fonts, radius, spacing } from '@/theme';

interface QuantityStepperProps {
  quantity: number;
  onChange: (q: number) => void;
  min?: number;
}

export function QuantityStepper({ quantity, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, quantity <= min && styles.btnDisabled]}
        onPress={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
      >
        <FontAwesomeIcon icon={faMinus} size={12} color={colors.muted} />
      </TouchableOpacity>
      <Text style={styles.qty}>{quantity}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => onChange(quantity + 1)}>
        <FontAwesomeIcon icon={faPlus} size={12} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

interface InlineNameProps {
  value: string;
  onSave: (v: string) => void;
  packed?: boolean;
}

export function InlineName({ value, onSave, packed }: InlineNameProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  const commit = () => {
    setFocused(false);
    const t = draft.trim();
    if (t && t !== value) onSave(t);
    else setDraft(value);
  };

  return (
    <TextInput
      value={focused ? draft : value}
      onChangeText={setDraft}
      onFocus={() => {
        setDraft(value);
        setFocused(true);
      }}
      onBlur={commit}
      onSubmitEditing={commit}
      style={[styles.name, packed && styles.packed]}
      multiline={false}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  btnDisabled: { opacity: 0.35 },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    color: colors.navy,
  },
  name: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
    padding: 0,
    margin: 0,
  },
  packed: { textDecorationLine: 'line-through', opacity: 0.6 },
});
