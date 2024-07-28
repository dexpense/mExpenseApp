import {StyleSheet, Text, View, ScrollView, BackHandler} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import {useGlobalContext} from '../context/Store';
const ChangeUP = () => {
  const {setActiveTab} = useGlobalContext();
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [myData, setMyData] = useState('');
  const [showLoder, setShowLoder] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showUPBtn, setShowUPBtn] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;
  const getMyData = async () => {
    setShowLoder(true);
    const user = JSON.parse(await EncryptedStorage.getItem('user'));
    if (user !== null) {
      setMyData(user);
      setShowLoder(false);
    } else {
      setMyData({
        username: 'username',
      });
      setShowLoder(false);
    }
  };
  const usernameChange = async () => {
    if (username !== '' && username !== myData.username) {
      setShowLoder(true);
      await firestore()
        .collection('userteachersapp')
        .where('username', '==', username)
        .get()
        .then(async snapshot => {
          const datas = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          if (datas.length === 0) {
            await firestore()
              .collection('userteachersapp')
              .doc(myData.id)
              .update({
                username: username,
              })
              .then(async () => {
                setShowLoder(false);
                await EncryptedStorage.clear();
                navigation.navigate('Login');
              })
              .catch(e => {
                setShowLoder(false);
                showToast('error', 'Username Change Failed!');
              });
          } else {
            setShowLoder(false);
            showToast('error', 'Username Already Taken!');
          }
        })
        .catch(e => {
          setShowLoder(false);
          showToast('error', 'Failed To Change Username');
          console.log(e);
        });
    } else {
      setShowLoder(false);
      showToast('error', 'Please Enter Valid Username');
    }
  };
  const nameChange = async () => {
    if (name !== '' && name !== myData.name) {
      setShowLoder(true);
      await firestore()
        .collection('userteachersapp')
        .doc(myData.id)
        .update({
          name: name,
        })
        .then(async () => {
          await EncryptedStorage.clear();
          navigation.navigate('Login');
        })
        .catch(e => {
          setShowLoder(false);
          showToast('error', 'Failed To Change Name');
          console.log(e);
        });
    } else {
      setShowLoder(false);
      showToast('error', 'Please Enter Valid Name');
    }
  };
  const passwordChange = async () => {
    if (
      password !== '' &&
      confPassword !== '' &&
      password === confPassword &&
      passwordPattern.test(password)
    ) {
      setShowLoder(true);
      await firestore()
        .collection('userteachersapp')
        .doc(myData.id)
        .update({
          password: bcrypt.hashSync(password, 10),
        })
        .then(async () => {
          await EncryptedStorage.clear();
          navigation.navigate('Login');
        })
        .catch(e => {
          showToast('error', 'Failed To Change Password');
          console.log(e);
        });
    } else {
      setShowLoder(false);
      showToast('error', 'Please Enter Valid Password');
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
        setActiveTab(0);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {
    getMyData();
  }, [isFocused]);
  useEffect(() => {}, [username, password, confPassword]);
  return (
    <ScrollView
      style={{
        marginBottom: responsiveHeight(8),
        marginTop: responsiveHeight(3),
      }}>
      <Text style={styles.heading}>Change Username & Password</Text>
      {showUPBtn ? (
        <View>
          <CustomButton
            title={'Change Username'}
            onClick={() => {
              setShowUsername(true);
              setShowPassword(false);
              setShowUPBtn(false);
              setShowName(false);
            }}
            color={'blueviolet'}
          />
          <CustomButton
            title={'Change Password'}
            onClick={() => {
              setShowUsername(false);
              setShowPassword(true);
              setShowUPBtn(false);
              setShowName(false);
            }}
            color={'green'}
          />
          <CustomButton
            title={'Change Your Name'}
            onClick={() => {
              setShowUsername(false);
              setShowPassword(false);
              setShowUPBtn(false);
              setShowName(true);
            }}
            color={'navy'}
          />
        </View>
      ) : null}
      {showUsername ? (
        <View>
          <Text style={styles.heading}>Change Username</Text>
          <Text style={styles.dropDownText}>
            Current Username: {myData.username}
          </Text>
          <CustomTextInput
            value={username}
            onChangeText={text => setUsername(text.replace(/\s/g, ''))}
            placeholder={'Enter Username'}
          />
          <CustomButton
            title={'Update Username'}
            color={'blue'}
            onClick={usernameChange}
          />
          <CustomButton
            title={'Cancel'}
            color={'purple'}
            onClick={() => {
              setShowUPBtn(true);
              setShowUsername(false);
            }}
          />
        </View>
      ) : null}
      {showPassword ? (
        <View>
          <Text style={styles.heading}>Change Password</Text>
          <CustomTextInput
            value={password}
            onChangeText={text => setPassword(text)}
            placeholder={'Enter Password'}
            secure={true}
            bgcolor={
              password === confPassword &&
              password !== '' &&
              passwordPattern.test(password)
                ? 'rgba(135, 255, 167,.3)'
                : 'transparent'
            }
          />
          <CustomTextInput
            value={confPassword}
            onChangeText={text => setConfPassword(text)}
            placeholder={'Confirm Password'}
            bgcolor={
              password === confPassword &&
              password !== '' &&
              passwordPattern.test(password)
                ? 'rgba(135, 255, 167,.3)'
                : 'transparent'
            }
          />
          <CustomButton
            title={'Update Password'}
            color={'blue'}
            onClick={passwordChange}
          />
          <CustomButton
            title={'Cancel'}
            color={'purple'}
            onClick={() => {
              setShowUPBtn(true);
              setShowPassword(false);
            }}
          />
        </View>
      ) : null}
      {showName ? (
        <View>
          <Text style={styles.heading}>Change Your Name</Text>
          <Text style={styles.dropDownText}>
            Your Current Name: {myData.name}
          </Text>
          <CustomTextInput
            value={name}
            onChangeText={text => setName(text)}
            placeholder={'Enter Your Name'}
          />
          <CustomButton
            title={'Update Your Name'}
            color={'blue'}
            onClick={nameChange}
          />
          <CustomButton
            title={'Cancel'}
            color={'purple'}
            onClick={() => {
              setShowUPBtn(true);
              setShowUsername(false);
              setShowName(false);
            }}
          />
        </View>
      ) : null}
      <Toast />
      <Loader visible={showLoder} />
    </ScrollView>
  );
};

export default ChangeUP;

const styles = StyleSheet.create({
  heading: {
    fontSize: responsiveFontSize(3),
    fontWeight: '800',
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(3),
    alignSelf: 'center',
    color: THEME_COLOR,
    textAlign: 'center',
  },

  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
});
