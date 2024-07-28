import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {THEME_COLOR} from '../utils/Colors';
import Bike from './Bike';
import CashBook from './CashBook';
import NoteBook from './NoteBook';
import Dashboard from './Dashboard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import ChangeUP from './ChangeUP';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import RNExitApp from 'react-native-exit-app';
import {useGlobalContext} from '../context/Store';
import BottomBar from './BottomBar';
const Main = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {state, activeTab, setActiveTab} = useGlobalContext();

  const refresh = () => {
    setActiveTab(0);
  };
  useEffect(() => {}, [isFocused]);
  const [backPressCount, setBackPressCount] = useState(0);

  const handleBackPress = useCallback(() => {
    if (backPressCount === 0) {
      setBackPressCount(prevCount => prevCount + 1);
      setTimeout(() => setBackPressCount(0), 2000);
    } else if (backPressCount === 1) {
      RNExitApp.exitApp();
    }
    return true;
  }, [backPressCount]);

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return backListener.remove;
  }, [handleBackPress]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity onPress={() => refresh()}>
            <Image
              source={require('../images/logo.png')}
              style={{width: responsiveWidth(15), height: responsiveWidth(15)}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{`${state.USER?.name
            .toUpperCase()
            .slice(0, 15)}'s\nExpense App`}</Text>
          <TouchableOpacity
            onPress={async () => {
              navigation.navigate('Login');
              await EncryptedStorage.clear();
            }}>
            <MaterialCommunityIcons name="logout" size={40} color={'red'} />
            <Text style={{color: 'red'}}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flex: 1, marginTop: responsiveHeight(7)}}>
        {activeTab === 0 ? (
          <Dashboard refresh={refresh} />
        ) : activeTab === 1 ? (
          <Bike refresh={refresh} />
        ) : activeTab === 2 ? (
          <CashBook refresh={refresh} />
        ) : activeTab === 3 ? (
          <NoteBook refresh={refresh} />
        ) : activeTab === 4 ? (
          <ChangeUP refresh={refresh} />
        ) : null}
      </View>
      <BottomBar />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    height: responsiveHeight(8.5),
    width: responsiveWidth(100),
    backgroundColor: '#ddd',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingLeft: responsiveWidth(2),
    paddingRight: responsiveWidth(2),
  },
  bottomText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: 5,
    marginBottom: responsiveHeight(2),
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '700',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
});
