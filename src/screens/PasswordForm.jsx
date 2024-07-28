import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import firestore from '@react-native-firebase/firestore';
import {secretKey} from '../modules/encryption';
import CryptoJS from 'react-native-crypto-js';
import Loader from '../components/Loader';
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
const PasswordForm = ({email}) => {
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;
  const [inputField, setInputField] = useState({
    otpCode: '',
    password: '',
    cpassword: '',
    email: email,
  });
  const [errField, setErrField] = useState({
    otpCodeErr: '',
    passwordErr: '',
    cpasswordErr: '',
  });

  const submitBtn = async () => {
    if (
      inputField.email !== '' &&
      inputField.otpCode !== '' &&
      inputField.password !== '' &&
      passwordPattern.test(inputField.password) &&
      inputField.cpassword !== '' &&
      inputField.password === inputField.cpassword
    ) {
      const url = `https://mexpensebackend.onrender.com/users/forgotPasswordApp`;
      let options = {
        method: 'POST',
        headers: {},
        data: inputField,
      };
      try {
        setLoader(true);
        let response = await axios(url, options);
        let record = response.data;
        if (record.statusText === 'Success') {
          await firestore()
            .collection('userteachersapp')
            .where('email', '==', inputField.email)
            .get()
            .then(async snapShot => {
              let id = snapShot.docs[0]._data.id;
              await firestore()
                .collection('userteachersapp')
                .doc(id)
                .update({
                  password: bcrypt.hashSync(inputField.password, 10),
                });
            });
          setLoader(false);
          showToast(
            'success',
            'Congrats! You are Password Reset is Successfull!',
          );
          setTimeout(async () => {
            await EncryptedStorage.clear();
            navigation.navigate('Login');
          }, 1500);
        } else {
          setLoader(false);
          showToast('error', record.message);
        }
      } catch (e) {
        setLoader(false);
        showToast('error', e);
      }
    } else {
      showToast('error', 'Form Is Invalid');
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [isFocused]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      <Image source={require('../images/bg.jpg')} style={styles.banner} />

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <CustomTextInput
          value={inputField.otpCode}
          placeholder={'Enter OTP'}
          type={'number-pad'}
          onChangeText={text =>
            setInputField({...inputField, otpCode: text.replace(/\s/g, '')})
          }
        />
        {errField.otpCodeErr.length > 0 && (
          <Text style={styles.label}>{errField.otpErr}</Text>
        )}
        <CustomTextInput
          value={inputField.password}
          secure={true}
          placeholder={'Enter Password'}
          onChangeText={text => setInputField({...inputField, password: text})}
        />
        {errField.passwordErr.length > 0 && (
          <Text style={styles.label}>{errField.passwordErr}</Text>
        )}
        <CustomTextInput
          value={inputField.cpassword}
          placeholder={'Confirm Password'}
          onChangeText={text => setInputField({...inputField, cpassword: text})}
        />
        {errField.passwordErr.length > 0 && (
          <Text style={styles.label}>{errField.cpasswordErr}</Text>
        )}
        <CustomButton title="Submit" onClick={submitBtn} />
        <CustomButton
          title="Cancel"
          onClick={() => navigation.navigate('Login')}
        />
      </View>
      <Loader visible={loader} />

      <Toast />
    </View>
  );
};

export default PasswordForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: responsiveWidth(100),
    height: responsiveHeight(30),
  },
  card: {
    width: responsiveWidth(90),
    height: responsiveHeight(100),
    backgroundColor: 'white',
    position: 'absolute',
    top: responsiveHeight(20),
    elevation: 5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
    marginTop: 5,
    color: THEME_COLOR,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textErr: {
    fontSize: responsiveFontSize(2),
    color: 'red',
    alignSelf: 'center',
    marginTop: responsiveHeight(4),
  },
  account: {
    marginLeft: responsiveWidth(2),
    color: THEME_COLOR,
    fontWeight: '600',
    fontSize: responsiveFontSize(2),
  },
});
