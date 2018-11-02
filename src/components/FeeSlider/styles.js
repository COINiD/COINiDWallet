import { StyleSheet } from 'react-native';
import { colors, fontSize } from '../../config/styling';

export default StyleSheet.create({
	estimationText: {
		fontSize: fontSize.small,
		color: colors.getTheme('light').fadedText
	},
	warningText: {
		fontSize: fontSize.small,
		color: colors.getTheme('light').warning
	},
	satByteDot: {
    backgroundColor: colors.getTheme('light').button,
    borderRadius: 18,
    position: 'absolute',
    zIndex: 100,
    paddingTop: 6,
    paddingBottom: 7,
    paddingHorizontal: 10,
  },
  satByteText: {
    color: colors.getTheme('light').buttonText,
  },
  thumb: {
  	width: 24,
  	height: 24,
  	borderRadius: 12
  },
  track: {
  	backgroundColor: colors.lightGray,
  	height: 2
  }
});
