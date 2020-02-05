import { Linking, StyleSheet } from 'react-native';
import moment from 'moment/min/moment-with-locales';
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
      title: 'settings.about.viewgithubcommit',
      onPress: () => openCommit(build.commit),
      hideChevron: false,
    });
  }

  if (build.tag) {
    items.push({
      title: 'settings.about.viewgithubrelease',
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
        title: 'settings.about.version',
        rightTitle: build.tag ? build.tag : `untagged-v${build.version}`,
        hideChevron: true,
      },
      {
        title: 'settings.about.commit',
        rightTitle: (build.dirty ? 'dirty-' : '') + build.commit,
        hideChevron: true,
      },
      {
        toggledState: {
          customRightTitleContainerStyle: styles.expandedRightTitle,
        },
        title: 'settings.about.buildtime',
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
