import palette from '../theme/colors';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  t1: {
    fontSize: 40,
    fontWeight: '400',
    color: '#000',
  },
  t2: {
    fontSize: 16,
    fontWeight: '400',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  button: {
    // flex:1,
    width: '100%',
    height: 55,
    color: palette.primary,
    backgroundColor: palette.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttontext: {
    fontSize: 18,
    fontWeight: 700,
    color: palette.surface,
  },
});

export default styles;
