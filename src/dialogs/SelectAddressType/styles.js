import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    maxHeight: 400,
  },
  loader: {
    marginBottom: 40,
    marginTop: 30,
  },
  amountText: {
    marginBottom: 4,
    textAlign: 'center',
    ...fontWeight.normal,
  },
  fiatText: {
    color: colors.gray,
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    ...fontWeight.book,
  },
  outgoing: {
    color: colors.orange,
  },
  incoming: {
    color: colors.green,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerLink: {
    fontSize: 16,
    marginRight: 5,
    textAlign: 'center',
  },

  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  rowTitle: {
    color: colors.gray,
    marginTop: 8,
  },
  rowContainer: {
    flex: 1,
  },
  rowData: {
    flex: 1,
    textAlign: 'right',
  },
  rowText: {
    fontSize: 16,
  },
});
