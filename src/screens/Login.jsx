import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  Alert,
  StatusBar,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
import {useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
const Login = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {setState} = useGlobalContext();
  const [visible, setVisible] = useState(false);
  const [disable, setDisable] = useState(true);
  const [inputField, setInputField] = useState({
    username: '',
    password: '',
  });
  const [errField, setErrField] = useState({
    usernameErr: '',
    passwordErr: '',
  });
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;

  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });

  const compare = (userPassword, serverPassword) => {
    let match = bcrypt.compareSync(userPassword, serverPassword);

    return match;
  };

  const validForm = () => {
    let formIsValid = true;
    setErrField({
      usernameErr: '',
      passwordErr: '',
      cpasswordErr: '',
    });
    if (inputField.username === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        usernameErr: 'Please Enter Name',
      }));
    }

    if (inputField.password === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        passwordErr: 'Please Enter Password',
      }));
    }

    return formIsValid;
  };
  const submitForm = async () => {
    if (validForm()) {
      setVisible(true);
      try {
        await firestore()
          .collection('userteachersapp')
          .where('username', '==', inputField.username)
          .get()
          .then(async snapShot => {
            let userRecord = snapShot.docs[0]._data;
            if (compare(inputField.password, userRecord.password)) {
              await EncryptedStorage.setItem(
                'user',
                JSON.stringify(userRecord),
              );
              setState({
                USER: userRecord,
                LOGGEDAT: Date.now(),
              }),
                setVisible(false);
              showToast(
                'success',
                `Congrats ${userRecord.name}!`,
                'You are Logined Successfully!',
              );
              setInputField({
                username: '',
                password: '',
              });
              setTimeout(() => navigation.navigate('Home'), 600);
            } else {
              setVisible(false);
              showToast('error', 'Invalid Password');
            }
          })
          .catch(e => {
            setVisible(false);
            console.log(e);
            showToast('error', 'Invalid Username');
          });
      } catch (e) {
        setVisible(false);
        console.log(e);
        showToast('error', 'Connection Error');
      }
    } else {
      showToast('error', 'Form Is Invalid');
    }
  };

  const showToast = (type, text, text2) => {
    Toast.show({
      type: type,
      text1: text,
      text2: text2,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };

  const checkLogin = async () => {
    const user = await EncryptedStorage.getItem('user');
    if (user) {
      setState({
        USER: JSON.parse(user),
        LOGGEDAT: Date.now(),
      });
      navigation.navigate('Home');
    }
  };
  useEffect(() => {}, [inputField]);
  useEffect(() => {
    checkLogin();
  }, [isFocused]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      <Image source={require('../images/bg.jpg')} style={styles.banner} />

      <View style={styles.card}>
        <Toast />
        <Text style={styles.title}>Login</Text>
        <CustomTextInput
          value={inputField.username}
          placeholder={'Enter Username'}
          onChangeText={text => setInputField({...inputField, username: text})}
        />
        {errField.usernameErr.length > 0 && (
          <Text style={styles.textErr}>{errField.usernameErr}</Text>
        )}
        <CustomTextInput
          secure={true}
          value={inputField.password}
          placeholder={'Enter Password'}
          onChangeText={text => {
            setInputField({...inputField, password: text});
            if (passwordPattern.test(text)) {
              setDisable(false);
            } else {
              setDisable(true);
            }
          }}
        />
        {errField.passwordErr.length > 0 && (
          <Text style={styles.textErr}>{errField.passwordErr}</Text>
        )}

        <CustomButton title="Login" btnDisable={disable} onClick={submitForm} />
        <View style={styles.row}>
          <Text style={{color: 'black', fontSize: 18}}>Don't Have Accout?</Text>
          <Text
            style={styles.account}
            onPress={() => navigation.navigate('Signup')}>
            Create One
          </Text>
        </View>
        <View style={[styles.row, {marginTop: 20}]}>
          <Text style={{color: 'black', fontSize: 18}}>Forgot Password?</Text>
          <Text
            style={styles.account}
            onPress={() => navigation.navigate('OTPForm')}>
            Click Here
          </Text>
        </View>
      </View>
      <Loader visible={visible} />
      <Toast />
    </View>
  );
};

export default Login;

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
    fontSize: responsiveFontSize(1),
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
