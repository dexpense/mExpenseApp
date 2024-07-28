import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import Toast from 'react-native-toast-message';
import {getDay, getFullYear, getMonthName} from '../modules/calculatefunctions';
import CryptoJS from 'react-native-crypto-js';
import {secretKey} from '../modules/encryption';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import ImageView from 'react-native-image-viewing';
import {downloadFile} from '../modules/downloadFile';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AutoHeightImage from 'react-native-auto-height-image';
import {useGlobalContext} from '../context/Store';
import BottomBar from './BottomBar';
const NoteDetails = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {state, stateObject} = useGlobalContext();
  const userID = state.USER.id;
  const [userData, setUserData] = useState([]);
  const data = stateObject;
  const [visible, setIsVisible] = useState(false);
  const decryptData = hashtext => {
    let bytes = CryptoJS.AES.decrypt(hashtext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  const getDetails = async () => {
    if (userID !== null) {
      setUserData(userID);
    } else {
      setUserData({
        name: 'M Expense',
      });
    }
  };
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  useEffect(() => {
    getDetails();
  }, [isFocused, userData]);
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ScrollView style={{marginBottom: responsiveHeight(8)}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Image
            source={require('../images/note.jpg')}
            style={{
              width: responsiveWidth(100),
              height: responsiveHeight(15),
              borderRadius: responsiveWidth(2),
              alignSelf: 'center',
              marginBottom: responsiveHeight(1),
            }}
          />
          <Text
            style={[
              styles.title,
              {
                position: 'absolute',
                right: responsiveWidth(6),
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255,.7)',
                borderRadius: responsiveWidth(2),
                padding: 5,
              },
            ]}>
            {`${userData.name}'s\nNOTES`}
          </Text>
        </View>
        <View style={[styles.itemView, {flexDirection: 'row'}]}>
          <Text
            style={[styles.title, {textAlign: 'center', color: 'darkorchid'}]}
            onLongPress={() => {
              Clipboard.setString(decryptData(data.noteTitle));
              showToast('success', 'Title Copied to Clipboard');
            }}>
            {decryptData(data.noteTitle).toUpperCase()}
          </Text>
          <TouchableOpacity
            style={{position: 'absolute', right: responsiveWidth(6)}}
            onPress={() => {
              Clipboard.setString(decryptData(data.noteTitle));
              showToast('success', 'Title Copied to Clipboard');
            }}>
            <MaterialCommunityIcons
              name="content-copy"
              size={20}
              color={THEME_COLOR}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.dateView,
            {
              flexDirection: 'row',
            },
          ]}>
          <Text style={styles.dropDownText}>
            Updated At: {getDay(data.date)}
          </Text>
          <Text style={styles.dropDownText}> {getMonthName(data.date)}</Text>
          <Text style={styles.dropDownText}> {getFullYear(data.date)}</Text>
        </View>
        {data.uri && (
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
              onPress={() => setIsVisible(true)}>
              <AutoHeightImage
                width={responsiveWidth(90)}
                source={{uri: data.uri}}
                style={{
                  borderRadius: responsiveWidth(2),
                  marginVertical: responsiveHeight(1),
                }}
              />
            </TouchableOpacity>
            <ImageView
              images={[{uri: data.uri}]}
              imageIndex={0}
              visible={visible}
              doubleTapToZoomEnabled={true}
              onRequestClose={() => setIsVisible(false)}
              FooterComponent={() => {
                return (
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      marginTop: -responsiveHeight(95.5),
                      marginLeft: responsiveWidth(60),
                    }}
                    onPress={async () =>
                      await downloadFile(data.uri, data.photoName)
                    }>
                    <MaterialIcons
                      name="download-for-offline"
                      color={'green'}
                      size={40}
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                margin: responsiveHeight(0.5),
              }}
              onPress={async () =>
                await downloadFile(data.uri, data.photoName)
              }>
              <MaterialIcons
                name="download-for-offline"
                color={'green'}
                size={30}
              />
              <Text style={[styles.text, {color: 'green'}]}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.dateView}>
          <Text
            style={[
              styles.dropDownText,
              {padding: 5, flexWrap: 'wrap', color: 'teal'},
            ]}
            onLongPress={() => {
              Clipboard.setString(decryptData(data.noteBody));
              showToast('success', 'Note Copied to Clipboard');
            }}>
            {decryptData(data.noteBody)}
          </Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: responsiveWidth(6),
              bottom: responsiveHeight(1),
            }}
            onPress={() => {
              Clipboard.setString(decryptData(data.noteBody));
              showToast('success', 'Note Copied to Clipboard');
            }}>
            <MaterialCommunityIcons
              name="content-copy"
              size={20}
              color={THEME_COLOR}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar />
      <Toast />
    </View>
  );
};

export default NoteDetails;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',

    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
    alignSelf: 'center',
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(5),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
    elevation: 5,
  },
  dateView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(5),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
    shadowColor: 'black',
    elevation: 5,
  },
  dropDownText: {
    fontSize: responsiveFontSize(2.5),
    color: 'blueviolet',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
