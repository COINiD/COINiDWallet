import { Linking, StyleSheet } from 'react-native';
import moment from 'moment';
import build from '../config/build';

const styles = StyleSheet.create({
  expandedRightTitle: {
    flex: 0,
  },
});

const openCommit = (commit) => {
  Linking.openURL(`https://github.com/COINiD/COINiDWallet/commit/${commit}`);
};

const openReleaseTag = (tag) => {
  Linking.openURL(`https://github.com/COINiD/COINiDWallet/releases/tag/${tag}`);
};

const getLinks = () => {
  const items = [];

  if (build.commit) {
    items.push({
      title: 'View commit on GitHub',
      onPress: () => openCommit(build.commit),
      hideChevron: false,
    });
  }

  if (build.tag) {
    items.push({
      title: 'View release on GitHub',
      onPress: () => openReleaseTag(build.tag),
      hideChevron: false,
    });
  }

  return items;
};

const About = () => [
  {
    items: [
      {
        title: 'Version',
        rightTitle: build.tag ? build.tag : `untagged-v${build.version}`,
        hideChevron: true,
      },
      {
        title: 'Commit',
        rightTitle: (build.dirty ? 'dirty-' : '') + build.commit,
        hideChevron: true,
      },
      {
        toggledState: {
          customRightTitleContainerStyle: styles.expandedRightTitle,
        },
        title: 'Build time',
        rightTitle: moment
          .unix(build.time)
          .utc()
          .format(),
        hideChevron: true,
        customRightTitleContainerStyle: styles.expandedRightTitle,
      },
    ],
  },
  {
    items: getLinks(),
  },
];

export default About;
