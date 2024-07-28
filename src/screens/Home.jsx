import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import Main from './Main';
import {useIsFocused} from '@react-navigation/native';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Using Math.random is not cryptographically secure! Use bcrypt.setRandomFallback to set a PRNG.',
  `ReactImageView: Image source "null" doesn't exist`,
]);
const Home = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {}, [isFocused]);

  return (
    <View style={{flex: 1}}>
      <Main navigation={navigation} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
