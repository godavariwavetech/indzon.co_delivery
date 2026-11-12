import palette from '../theme/colors';
import React, {useEffect, useState} from 'react';
import {Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// One date picker for both platforms.
// Android: the native calendar dialog (single tap to pick).
// iOS: display="default" renders a compact date button that opens a second
// picker, so users had to tap several times. Show an inline calendar in a
// modal instead, with Cancel/Done.
const DatePickerModal = ({visible, value, onConfirm, onCancel, minimumDate, maximumDate}) => {
  const [draft, setDraft] = useState(value || new Date());

  // Reset the draft only when the picker opens; `value` may be a new Date
  // object on every parent render.
  useEffect(() => {
    if (visible) setDraft(value || new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value || new Date()}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={(event, date) => {
          if (event.type === 'set' && date) onConfirm(date);
          else onCancel();
        }}
      />
    );
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet}>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            themeVariant="light"
            accentColor={palette.primary}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(event, date) => date && setDraft(date)}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={onCancel}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => onConfirm(draft)}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Screens store dates as "DD-MM-YYYY" strings.
export const parseDayMonthYear = text => {
  const [day, month, year] = String(text || '').split('-').map(Number);
  if (!day || !month || !year) return new Date();
  return new Date(year, month - 1, day);
};

export const formatDayMonthYear = date =>
  date.toLocaleDateString('en-GB').split('/').join('-');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  action: {paddingVertical: 12, paddingHorizontal: 16},
  cancel: {fontSize: 16, color: palette.textSecondary},
  done: {fontSize: 16, fontWeight: '600', color: palette.primary},
});

export default DatePickerModal;
