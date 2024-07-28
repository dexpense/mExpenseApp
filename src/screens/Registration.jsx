import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import Loader from '../components/Loader';
import {useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
const Registration = () => {
  const isFocused = useIsFocused();
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const docId = uuid.v4().split('-')[0];
  const [inputField, setInputField] = useState({
    name: '',
    email: '',
    mobile: '',
    id: docId,
    username: '',
    password: '',
    cpassword: '',
    createdAt: Date.now(),
  });
  useEffect(() => {}, [inputField]);
  const validForm = () => {
    let formIsValid = true;

    if (inputField.username === '') {
      formIsValid = false;
    }
    if (inputField.email === '' || !ValidateEmail(inputField.email)) {
      formIsValid = false;
    }
    if (inputField.mobile === '') {
      formIsValid = false;
    }
    if (inputField.password === '') {
      formIsValid = false;
    }
    if (!passwordPattern.test(inputField.password)) {
      formIsValid = false;
    }
    if (
      inputField.cpassword === '' ||
      inputField.password !== inputField.cpassword
    ) {
      formIsValid = false;
    }
    return formIsValid;
  };

  function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail)) {
      return true;
    }
    // alert("You have entered an invalid email address!");
    return false;
  }

  const registerUser = async () => {
    if (validForm()) {
      setVisible(true);

      const backendUrl = `https://expense365.vercel.app/api/signUp`;

      try {
        let response = await axios.post(backendUrl, {
          name: inputField.name,
          email: inputField.email,
          mobile: inputField.mobile,
          id: docId,
          username: inputField.username,
          password: bcrypt.hashSync(inputField.password, 10),
          createdAt: inputField.createdAt,
        });
        let record = response.data;
        if (record.success) {
          await firestore()
            .collection('userteachersapp')
            .doc(docId)
            .set({
              name: inputField.name,
              email: inputField.email,
              mobile: inputField.mobile,
              id: docId,
              photoName: '',
              url: '',
              username: inputField.username,
              password: bcrypt.hashSync(inputField.password, 10),
              createdAt: inputField.createdAt,
            });

          setVisible(false);
          showToast(
            'success',
            `Congratulation ${inputField.name} You are Successfully Registered!`,
          );

          setTimeout(() => navigation.navigate('Login'), 1500);
        } else {
          showToast('error', 'Something Went Wrong!');
        }
      } catch (e) {
        setVisible(false);
        showToast('error', 'Something Went Wrong!');
        console.log(e);
      }
    } else {
      setVisible(false);
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

      <ScrollView style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        {/* <Text style={styles.label}>Email</Text> */}
        <CustomTextInput
          placeholder={'Enter Name'}
          value={inputField.name}
          onChangeText={text => setInputField({...inputField, name: text})}
        />
        <CustomTextInput
          placeholder={'Enter Email'}
          type={'email-address'}
          value={inputField.email}
          onChangeText={text => setInputField({...inputField, email: text})}
        />

        {/* <Text style={styles.label}>Mobile</Text> */}
        <CustomTextInput
          placeholder={'Enter Mobile Number'}
          type={'number-pad'}
          value={inputField.mobile}
          onChangeText={text =>
            setInputField({...inputField, mobile: text.replace(/\s/g, '')})
          }
        />

        {/* <Text style={styles.label}>Username</Text> */}
        <CustomTextInput
          placeholder={'Enter Username'}
          value={inputField.username}
          onChangeText={text =>
            setInputField({
              ...inputField,
              username: text.replace(/\s/g, ''),
            })
          }
        />

        {/* <Text style={styles.label}>Password</Text> */}
        <CustomTextInput
          placeholder={'Enter Password'}
          secure={true}
          value={inputField.password}
          onChangeText={text => setInputField({...inputField, password: text})}
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.password !== '' &&
            passwordPattern.test(inputField.password)
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        {/* <Text style={styles.label}>Confirm Password</Text> */}
        <CustomTextInput
          placeholder={'Enter Confirm Password'}
          value={inputField.cpassword}
          onChangeText={text => setInputField({...inputField, cpassword: text})}
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.password !== '' &&
            passwordPattern.test(inputField.password)
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        <CustomButton title="Sign Up" onClick={registerUser} />
      </ScrollView>

      <Loader visible={visible} />
      <Toast />
    </View>
  );
};

export default Registration;

const styles = StyleSheet.create({
  backBtn: {
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    backgroundColor: 'rgba(255,255,255,.6)',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 20,
    borderRadius: 10,
  },
  backIcon: {
    width: responsiveWidth(8),
    height: responsiveWidth(8),
    tintColor: THEME_COLOR,
  },

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
    top: responsiveHeight(15),
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
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
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
