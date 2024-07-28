import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  Image,
  StatusBar,
} from 'react-native';
import React, {useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
const Splash = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {setState} = useGlobalContext();
  const getDetails = async () => {
    try {
      const userID = JSON.parse(await EncryptedStorage.getItem('user'));
      if (userID != null) {
        setState({
          USER: userID,
          LOGGEDAT: Date.now(),
        });
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      } else {
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDetails();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      <Image
        source={require('../images/logo.png')}
        style={{width: responsiveWidth(60), height: responsiveWidth(60)}}
      />
      <Text style={styles.logoText}>Digitizing</Text>
      <Text style={styles.logoText}>Your</Text>
      <Text style={styles.logoText}>Needs</Text>
      <View style={{margin: responsiveHeight(2)}}>
        <ActivityIndicator size={50} color={'white'} />
      </View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
  },
  logoText: {
    fontSize: responsiveFontSize(6),
    fontWeight: '800',
    color: 'white',
    marginTop: responsiveHeight(1),
  },
});
