import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Switch,
  Image,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import Feather from 'react-native-vector-icons/Feather';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';
import {useIsFocused} from '@react-navigation/native';
import uuid from 'react-native-uuid';

import EncryptedStorage from 'react-native-encrypted-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {
  IndianFormat,
  getDay,
  getFullYear,
  getMonthName,
} from '../modules/calculatefunctions';

import {useNavigation} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import {useGlobalContext} from '../context/Store';
const CashBook = () => {
  const {
    state,
    setActiveTab,
    accountState,
    setAccountState,
    transactionState,
    setTransactionState,
    fuelingState,
    setFuelingState,
    setStateObject,
  } = useGlobalContext();
  const userID = state.USER.id;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [disable, setDisable] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAccounts, setShowAccounts] = useState(true);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Bank');
  const [amount, setAmount] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountType, setEditAccountType] = useState('Bank');
  const [editAmount, setEditAmount] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [allAccounts, setAllAccounts] = useState([]);
  const [transferingAdmin, setTransferingAdmin] = useState({});
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [receivingAdmin, setReceivingAdmin] = useState({});
  const [showData, setShowData] = useState(false);
  const [showTransferData, setShowTransferData] = useState(false);
  const [showTranferSelector, setShowTranferSelector] = useState(false);
  const [isclicked, setIsclicked] = useState(false);
  const [isTransferClicked, setIsTransferClicked] = useState(false);
  const [showTransferBtn, setShowTransferBtn] = useState(true);
  const [showTransferView, setShowTransferView] = useState(false);
  const [transferingAmount, setTransferingAmount] = useState('');
  const [transferingPurpose, setTransferingPurpose] = useState('');
  const docId = uuid.v4();
  const [isEnabled, setIsEnabled] = useState(false);
  const [editIsEnabled, setEditIsEnabled] = useState(false);

  const [editID, seteditID] = useState('');
  const [visibleItems, setVisibleItems] = useState(5);

  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const calculateDate = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setOpen('');
    setDate(currentSelectedDate);

    setFontColor('black');
  };

  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 5);
  };
  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      setAccountType('Bank');
    } else {
      setAccountType('Cash');
    }
  };
  const editToggleSwitch = () => {
    setEditIsEnabled(!editIsEnabled);
    setDisable(false);
    if (editIsEnabled) {
      setEditAccountType('Bank');
    } else {
      setEditAccountType('Cash');
    }
  };
  const addAccount = async () => {
    if (accountName !== '' && accountType !== '' && amount !== '') {
      setShowLoader(true);
      let usersName = state.USER.name;

      await firestore()
        .collection('accounts')
        .doc(docId)
        .set({
          date: Date.now(),
          id: docId,
          accountHolderName: usersName,
          addedBy: userID,
          accountName: accountName,
          accountType: accountType,
          amount: parseFloat(amount),
          recentTransaction: parseFloat(amount),
          url: '',
          photoName: '',
        })
        .then(() => {
          setAccountState(
            [
              ...accountState,
              {
                date: Date.now(),
                id: docId,
                accountHolderName: usersName,
                addedBy: userID,
                accountName: accountName,
                accountType: accountType,
                amount: parseFloat(amount),
                recentTransaction: parseFloat(amount),
                url: '',
                photoName: '',
              },
            ].sort((a, b) => b.date - a.date),
          );
          setShowLoader(false);
          showToast('success', 'Account Added Successfully');
          setShowAccounts(false);
          setAccountName('');
          setAccountType('Cash');
          setIsEnabled(false);
          setAmount('');
          setShowAddAccount(false);
          setShowAccounts(true);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', e);
        });
    } else {
      showToast('error', 'Invalid Data');
      console.log(accountName, accountType, amount);
    }
  };
  const getAccounts = async () => {
    setShowLoader(true);

    await firestore()
      .collection('accounts')
      .where('addedBy', '==', userID)
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => b.date - a.date);
        // let filteredData = newData.filter(el => el.addedBy.match(userID));
        setShowLoader(false);
        setAllAccounts(newData);
        setAccountState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const getTransactions = async () => {
    setShowLoader(true);
    await firestore()
      .collection('transactions')
      .where('addedBy', '==', userID)
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => b.date - a.date);
        setShowLoader(false);
        setTransactionState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
        console.log(e);
      });
  };

  const getFueling = async () => {
    setShowLoader(true);
    await firestore()
      .collection('fueling')
      .where('addedBy', '==', userID)
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => b.date - a.date);
        setShowLoader(false);
        setFuelingState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
        console.log(e);
      });
  };

  const showConfirmDialog = (id, photoName) => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This Account?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Account Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          deleteData(id, photoName);
        },
      },
    ]);
  };

  const deleteData = async (id, photoName) => {
    setShowLoader(true);
    await firestore()
      .collection('accounts')
      .doc(id)
      .delete()
      .then(async () => {
        const deletableAccountsTransactions = transactionState.filter(
          item => item.accountID === id,
        );
        const deletableAccountsFuelings = fuelingState.filter(
          item => item.accountID === id,
        );

        setTransactionState(
          transactionState.filter(item => item.accountID !== id),
        );
        deletableAccountsTransactions.map(async el => {
          await firestore().collection('transactions').doc(el.id).delete();
        });
        deletableAccountsFuelings.map(async el => {
          await firestore().collection('fueling').doc(el.id).delete();
        });
        setFuelingState(fuelingState.filter(item => item.accountID !== id));
        if (photoName) {
          let imageRef = storage().ref('/userAccounts/' + photoName);
          imageRef
            .delete()
            .then(async () => {
              showToast('success', 'Account Deleted Successfully');
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', 'Account Deletation Failed');
              console.log(e);
            });
        } else {
          showToast('success', 'Account Deleted Successfully');
        }
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
        console.log(e);
      });
  };
  const updateData = async () => {
    if (
      editAccountName !== '' &&
      editAccountType !== '' &&
      editAmount !== '' &&
      editID !== ''
    ) {
      setShowLoader(true);

      await firestore()
        .collection('accounts')
        .doc(editID)
        .update({
          accountName: editAccountName,
          accountType: editAccountType,
          amount: parseFloat(editAmount),
          date: Date.now(),
        });
      const exceptThisAccount = accountState.filter(
        item => item.id === transferingAdmin.id,
      );
      const thisAccount = accountState.filter(
        item => item.id === transferingAdmin.id,
      )[0];
      thisAccount.accountName = editAccountName;
      thisAccount.accountType = editAccountType;
      thisAccount.amount = parseFloat(editAmount);
      thisAccount.date = Date.now();
      setAccountState(
        [...exceptThisAccount, thisAccount].sort((a, b) => b.date - a.date),
      );
      setShowLoader(false);
      setVisible(false);

      showToast('success', 'Details Updated Successfully');
    } else {
      showToast('error', 'Invalid Data');
    }
  };
  const removeTransferingAdmin = item => {
    let removeTransferee = allAccounts.filter(
      el => el.accountName !== item.accountName,
    );
    setFilteredAccounts(removeTransferee);
  };
  const transferAmountToAdmin = async () => {
    if (
      transferingAdmin.accountName !== '' &&
      transferingAdmin.amount !== '' &&
      receivingAdmin.accountName !== '' &&
      receivingAdmin.amount !== '' &&
      transferingAmount !== '' &&
      transferingPurpose !== '' &&
      transferingAdmin.amount > parseFloat(transferingAmount)
    ) {
      setShowLoader(true);
      await firestore()
        .collection('accounts')
        .doc(transferingAdmin.id)
        .update({
          amount:
            parseFloat(transferingAdmin.amount) - parseFloat(transferingAmount),
          date: Date.parse(date),
          recentTransaction: parseFloat(transferingAmount),
        })
        .then(async () => {
          const exceptThisAccount = accountState.filter(
            item => item.id === transferingAdmin.id,
          );
          const thisAccount = accountState.filter(
            item => item.id === transferingAdmin.id,
          )[0];
          thisAccount.amount =
            parseFloat(transferingAdmin.amount) - parseFloat(transferingAmount);
          thisAccount.date = Date.parse(date);
          thisAccount.recentTransaction = parseFloat(transferingAmount);
          setAccountState(
            [...exceptThisAccount, thisAccount].sort((a, b) => b.date - a.date),
          );
          await firestore()
            .collection('accounts')
            .doc(receivingAdmin.id)
            .update({
              amount:
                parseFloat(receivingAdmin.amount) +
                parseFloat(transferingAmount),
              date: Date.parse(date),
              recentTransaction: parseFloat(transferingAmount),
            })
            .then(async () => {
              const exceptThisAccount = accountState.filter(
                item => item.id !== receivingAdmin.id,
              );
              const thisAccount = accountState.filter(
                item => item.id === receivingAdmin.id,
              )[0];
              thisAccount.amount =
                parseFloat(receivingAdmin.amount) +
                parseFloat(transferingAmount);
              thisAccount.date = Date.parse(date);
              thisAccount.recentTransaction = parseFloat(transferingAmount);
              setAccountState(
                [...exceptThisAccount, thisAccount].sort(
                  (a, b) => b.date - a.date,
                ),
              );
              await firestore()
                .collection('transactions')
                .doc(docId)
                .set({
                  date: Date.parse(date),
                  id: docId,
                  accountName: transferingAdmin.accountName,
                  accountID: transferingAdmin.id,
                  addedBy: userID,
                  amount: parseFloat(transferingAmount),
                  purpose: transferingPurpose,
                  transactionType: 'Debit',
                  previousAmount: parseFloat(transferingAdmin.amount),
                  currentAmount:
                    parseFloat(transferingAdmin.amount) -
                    parseFloat(transferingAmount),
                })
                .then(async () => {
                  setTransactionState([
                    ...transactionState,
                    {
                      date: Date.parse(date),
                      id: docId,
                      accountName: transferingAdmin.accountName,
                      accountID: transferingAdmin.id,
                      addedBy: userID,
                      amount: parseFloat(transferingAmount),
                      purpose: transferingPurpose,
                      transactionType: 'Debit',
                      previousAmount: parseFloat(transferingAdmin.amount),
                      currentAmount:
                        parseFloat(transferingAdmin.amount) -
                        parseFloat(transferingAmount),
                    },
                    {
                      date: Date.parse(date),
                      id: docId + '-' + 'transfer',
                      accountName: receivingAdmin.accountName,
                      accountID: receivingAdmin.id,
                      addedBy: userID,
                      amount: parseFloat(transferingAmount),
                      purpose: transferingPurpose,
                      transactionType: 'Credit',
                      previousAmount: parseFloat(receivingAdmin.amount),
                      currentAmount:
                        parseFloat(receivingAdmin.amount) +
                        parseFloat(transferingAmount),
                    },
                  ]);
                  await firestore()
                    .collection('transactions')
                    .doc(docId + '-' + 'transfer')
                    .set({
                      date: Date.parse(date),
                      id: docId + '-' + 'transfer',
                      accountName: receivingAdmin.accountName,
                      accountID: receivingAdmin.id,
                      addedBy: userID,
                      amount: parseFloat(transferingAmount),
                      purpose: transferingPurpose,
                      transactionType: 'Credit',
                      previousAmount: parseFloat(receivingAdmin.amount),
                      currentAmount:
                        parseFloat(receivingAdmin.amount) +
                        parseFloat(transferingAmount),
                    })
                    .then(() => {
                      setShowLoader(false);
                      showToast('success', 'Amount Transfer Successfull!');
                      setShowTransferView(false);
                      setShowTransferBtn(true);
                      setShowAddAccount(false);
                      setShowAccounts(true);
                      setIsTransferClicked(false);
                      setShowTranferSelector(false);
                      setTransferingAdmin(allAccounts);
                      setShowTransferData(false);
                      setTransferingAmount('');
                      setTransferingPurpose('');
                      setDate(new Date());
                    })
                    .catch(e => {
                      setShowLoader(false);
                      showToast('error', 'Something Went Wrong');
                      console.log(e);
                    });
                })
                .catch(e => {
                  setShowLoader(false);
                  showToast('error', 'Something Went Wrong');
                  console.log(e);
                });
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', 'Something Went Wrong');
              console.log(e);
            });
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Invalid Data');
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
    if (accountState.length === 0) {
      getAccounts();
    } else {
      setAllAccounts(accountState.sort((a, b) => b.date - a.date));
    }
    if (transactionState.length === 0) {
      getTransactions();
    }
    if (fuelingState.length === 0) {
      getFueling();
    }
  }, [isFocused]);
  useEffect(() => {}, [
    isEnabled,

    filteredAccounts,
    transferingAmount,
    transferingPurpose,
    transferingAdmin,
  ]);
  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{
          marginBottom: responsiveHeight(8),
          marginTop: responsiveHeight(2),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: responsiveHeight(1),
              marginTop: responsiveHeight(1),
            }}
            onPress={() => {
              setShowAddAccount(!showAddAccount);
              setShowAccounts(!showAccounts);
              setShowTransferView(false);
            }}>
            <Feather
              name={showAddAccount ? 'minus-circle' : 'plus-circle'}
              size={20}
              color={THEME_COLOR}
            />
            <Text style={styles.title}>
              {showAddAccount ? 'Hide Add Accounts' : 'Add New Accounts'}
            </Text>
          </TouchableOpacity>
          {showTransferBtn && !showAddAccount ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: responsiveWidth(5),
              }}
              onPress={() => {
                setShowTransferView(!showTransferView);

                setShowAddAccount(false);
                setShowAccounts(!showAccounts);
                setIsTransferClicked(false);
                setShowTranferSelector(false);
                setTransferingAdmin(allAccounts);
                setReceivingAdmin(allAccounts);
                setShowTransferData(false);
              }}>
              <FontAwesome6
                name={'money-bill-transfer'}
                size={20}
                color={THEME_COLOR}
              />
              {!showTransferView ? (
                <Text style={styles.title}>Transfer Amount</Text>
              ) : (
                <Text style={styles.title}>Hide Transfer Amount</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
        {showAddAccount ? (
          <View>
            <CustomTextInput
              placeholder={'Enter Account Name'}
              value={accountName}
              onChangeText={text => setAccountName(text)}
            />

            <CustomTextInput
              placeholder={'Enter Amount'}
              type={'number-pad'}
              value={amount}
              onChangeText={text => setAmount(text.replace(/\s/g, ''))}
            />
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(1),
                marginBottom: responsiveHeight(1),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                Bank
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
              <Text style={[styles.title, {paddingLeft: responsiveWidth(1.5)}]}>
                Cash
              </Text>
            </View>
            <CustomButton title={'Add Account'} onClick={addAccount} />

            <CustomButton
              title={'Cancel'}
              color={'darkred'}
              onClick={() => {
                setShowAddAccount(false);
                setAccountName('');
                setAccountType('Bank');
                setAmount('');
                setShowAddAccount(!showAddAccount);
                setShowAccounts(true);
              }}
            />
          </View>
        ) : null}
        {showTransferView ? (
          <ScrollView
            style={{
              marginTop: responsiveHeight(2),
              marginBottom: responsiveHeight(2),
            }}>
            <View>
              <Text
                style={[
                  styles.heading,
                  {textAlign: 'center', fontSize: 15, marginTop: 5},
                ]}>
                Select From Which Account To Transfer
              </Text>

              <TouchableOpacity
                style={[styles.dropDownnSelector, {marginTop: 5}]}
                onPress={() => {
                  setIsclicked(!isclicked);
                  setTransferingAdmin(allAccounts);
                  setShowData(!showData);
                  setReceivingAdmin(allAccounts);
                  setShowTransferData(false);
                }}>
                <Text style={styles.dropDownTextTransfer}>
                  {transferingAdmin.accountName}
                </Text>

                {isclicked ? (
                  <AntDesign name="up" size={30} color={THEME_COLOR} />
                ) : (
                  <AntDesign name="down" size={30} color={THEME_COLOR} />
                )}
              </TouchableOpacity>
              {isclicked ? (
                <ScrollView style={styles.dropDowArea}>
                  {allAccounts.map((item, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.AdminName}
                        onPress={() => {
                          setTransferingAdmin(item);
                          setIsclicked(false);
                          setShowData(true);
                          setShowTranferSelector(true);
                          removeTransferingAdmin(item);
                        }}>
                        <Text style={styles.dropDownTextTransfer}>
                          {item.accountName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}
              {showData ? (
                transferingAdmin.accountName ? (
                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: 'row',
                      alignSelf: 'center',
                    }}>
                    <Text style={styles.dropDownTextTransfer}>Balance: </Text>
                    <Text style={styles.dropDownTextTransfer}>
                      ₹{IndianFormat(transferingAdmin.amount)}
                    </Text>
                  </View>
                ) : null
              ) : null}
              {showTranferSelector ? (
                <ScrollView>
                  <Text
                    style={[
                      styles.heading,
                      {textAlign: 'center', fontSize: 15, marginTop: 5},
                    ]}>
                    Select Which Account To Pay
                  </Text>

                  <TouchableOpacity
                    style={[styles.dropDownnSelector, {marginTop: 5}]}
                    onPress={() => {
                      setIsTransferClicked(!isTransferClicked);
                      setReceivingAdmin(allAccounts);
                      setShowTransferData(false);
                    }}>
                    <Text style={styles.dropDownTextTransfer}>
                      {receivingAdmin.accountName}
                    </Text>

                    {isTransferClicked ? (
                      <AntDesign name="up" size={30} color={THEME_COLOR} />
                    ) : (
                      <AntDesign name="down" size={30} color={THEME_COLOR} />
                    )}
                  </TouchableOpacity>
                  {isTransferClicked ? (
                    <ScrollView style={styles.dropDowArea}>
                      {filteredAccounts.map((item, index) => {
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.AdminName}
                            onPress={() => {
                              setReceivingAdmin(item);
                              setIsTransferClicked(false);
                              setShowTransferData(true);
                            }}>
                            <Text style={styles.dropDownTextTransfer}>
                              {item.accountName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  ) : null}
                </ScrollView>
              ) : null}
              {showTransferData ? (
                receivingAdmin.accountName ? (
                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: 'row',
                      alignSelf: 'center',
                    }}>
                    <Text style={styles.dropDownTextTransfer}>Balance: </Text>
                    <Text style={styles.dropDownTextTransfer}>
                      ₹{IndianFormat(receivingAdmin.amount)}
                    </Text>
                  </View>
                ) : null
              ) : null}
              {showTransferData ? (
                <View style={{margin: responsiveHeight(1)}}>
                  <CustomTextInput
                    placeholder={'Enter Amount to Transfer'}
                    value={transferingAmount}
                    type={'number-pad'}
                    onChangeText={text => setTransferingAmount(text)}
                  />
                  <CustomTextInput
                    placeholder={'Enter Purpose of Transfer'}
                    value={transferingPurpose}
                    onChangeText={text => setTransferingPurpose(text)}
                  />
                  <View>
                    <Text style={styles.label}>Enter Transaction Date</Text>
                    <TouchableOpacity
                      style={{
                        marginTop: 10,
                        borderColor: 'skyblue',
                        borderWidth: 1,
                        width: responsiveWidth(76),
                        height: 50,
                        alignSelf: 'center',
                        borderRadius: responsiveWidth(3),
                        justifyContent: 'center',
                      }}
                      onPress={() => setOpen(true)}>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(1.6),
                          color: fontColor,
                          paddingLeft: 14,
                        }}>
                        {date.getDate() < 10
                          ? '0' + date.getDate()
                          : date.getDate()}
                        -
                        {date.getMonth() + 1 < 10
                          ? `0${date.getMonth() + 1}`
                          : date.getMonth() + 1}
                        -{date.getFullYear()}
                      </Text>
                    </TouchableOpacity>

                    {open && (
                      <DateTimePickerAndroid
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        maximumDate={Date.parse(new Date())}
                        minimumDate={new Date('01-01-2023')}
                        display="default"
                        onChange={calculateDate}
                      />
                    )}
                  </View>
                  <CustomButton
                    title={'Transfer Amount'}
                    onClick={transferAmountToAdmin}
                  />
                  <CustomButton
                    title={'Cancel'}
                    color={'darkred'}
                    onClick={() => {
                      setShowTransferView(false);
                      setShowTransferBtn(true);
                      setShowAddAccount(false);
                      setShowAccounts(true);
                      setTransferingAdmin(allAccounts);
                      setReceivingAdmin(allAccounts);
                      setShowTransferData(false);
                      setIsTransferClicked(false);
                      setTransferingAmount('');
                      setTransferingPurpose('');
                    }}
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
        <ScrollView style={{marginBottom: responsiveHeight(2)}}>
          {showAccounts &&
          !showTransferView &&
          !showAddAccount &&
          allAccounts.length
            ? allAccounts.slice(0, visibleItems).map((el, ind) => {
                return (
                  <ScrollView style={styles.itemView} key={ind}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: responsiveWidth(1),
                        alignSelf: 'center',
                      }}
                      onPress={() => {
                        navigation.navigate('Account Details');
                        setStateObject(el);
                      }}>
                      <Image
                        source={
                          el.accountType === 'Bank'
                            ? require('../images/bank.png')
                            : require('../images/cash.png')
                        }
                        style={{
                          width: responsiveWidth(20),
                          height: responsiveWidth(20),
                          borderRadius: responsiveWidth(2),
                        }}
                      />

                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          paddingLeft: responsiveWidth(5),
                          flexWrap: 'wrap',
                          alignSelf: 'center',
                        }}>
                        <Text
                          style={[
                            styles.label,
                            {textAlign: 'center', flexWrap: 'wrap'},
                          ]}>
                          {`Account Name: \n ${el.accountName
                            .toUpperCase()
                            .slice(0, 17)}`}
                        </Text>
                        <Text
                          style={[
                            styles.label,
                            {textAlign: 'center', flexWrap: 'wrap'},
                          ]}>
                          Account Type: {el.accountType}
                        </Text>
                        <View
                          style={{flexDirection: 'row', alignSelf: 'center'}}>
                          <Text
                            style={[
                              styles.label,
                              {textAlign: 'center', flexWrap: 'wrap'},
                            ]}>
                            Account Balance:{' '}
                          </Text>
                          <Text
                            style={[
                              styles.label,
                              {
                                textAlign: 'center',
                                flexWrap: 'wrap',
                                color: el.amount < 0 ? 'red' : THEME_COLOR,
                              },
                            ]}>
                            {el.amount >= 0
                              ? IndianFormat(el.amount)
                              : `-₹${IndianFormat(el.amount * -1)}`}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}>
                          <Text style={styles.dropDownText}>
                            Updated At: {getDay(el.date)}
                          </Text>
                          <Text style={styles.dropDownText}>
                            {' '}
                            {getMonthName(el.date)}
                          </Text>
                          <Text style={styles.dropDownText}>
                            {' '}
                            {getFullYear(el.date)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          alignSelf: 'center',
                          padding: responsiveWidth(2),
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            setVisible(true);
                            setEditAccountName(el.accountName);
                            setEditAccountType(el.accountType);
                            setEditAmount(el.amount.toString());
                            seteditID(el.id);

                            el.accountType === 'Bank'
                              ? setEditIsEnabled(false)
                              : setEditIsEnabled(true);
                          }}>
                          <Text>
                            <FontAwesome5 name="edit" size={25} color="blue" />
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{paddingTop: responsiveHeight(4)}}
                          onPress={() => {
                            showConfirmDialog(el.id, el.photoName);
                          }}>
                          <Text>
                            <Ionicons name="trash-bin" size={25} color="red" />
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                );
              })
            : null}
          {showAccounts &&
            !showAddAccount &&
            visibleItems < allAccounts.length && (
              <CustomButton title={'Show More'} onClick={loadMore} />
            )}
        </ScrollView>
        <Modal animationType="slide" visible={visible} transparent>
          <View style={styles.modalView}>
            <View style={styles.mainView}>
              <Text
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}>
                Edit Account Details
              </Text>

              <CustomTextInput
                placeholder={'Enter Account Name'}
                value={editAccountName}
                onChangeText={text => {
                  setDisable(false);
                  setEditAccountName(text);
                }}
              />
              <CustomTextInput
                placeholder={'Enter Amount'}
                type={'number-pad'}
                value={editAmount}
                onChangeText={text => {
                  setDisable(false);
                  setEditAmount(text.replace(/\s/g, ''));
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(1),
                  marginBottom: responsiveHeight(1),
                }}>
                <Text
                  style={[styles.title, {paddingRight: responsiveWidth(2)}]}>
                  Bank
                </Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={editToggleSwitch}
                  value={editIsEnabled}
                />
                <Text style={[styles.title, {paddingLeft: responsiveWidth(2)}]}>
                  Cash
                </Text>
              </View>
              <CustomButton
                title={'Update'}
                btnDisable={disable}
                onClick={updateData}
              />
              <CustomButton
                title={'Close'}
                color={'purple'}
                onClick={() => setVisible(false)}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default CashBook;

const styles = StyleSheet.create({
  uploadPic: {
    borderColor: THEME_COLOR,
    borderWidth: 1,
    borderRadius: 20,
    width: responsiveHeight(44),
    height: responsiveHeight(25),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    paddingLeft: responsiveWidth(1),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '400',
    marginTop: responsiveHeight(0.5),
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(94),
    backgroundColor: 'white',

    alignSelf: 'center',
    borderRadius: 10,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: responsiveWidth(2),
    shadowColor: 'black',
    elevation: 5,
  },
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),
    height: responsiveHeight(35),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropDownText: {
    fontSize: responsiveFontSize(1.5),
    color: 'darkred',
    alignSelf: 'center',
    textAlign: 'center',
  },
  dropDownTextTransfer: {
    fontSize: responsiveFontSize(1.8),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
  dropDownnSelector: {
    width: responsiveWidth(90),
    height: responsiveHeight(7),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: THEME_COLOR,
    alignSelf: 'center',
    marginTop: responsiveHeight(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
  },
  dropDowArea: {
    width: responsiveWidth(90),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
  },
  AdminName: {
    width: responsiveWidth(90),
    height: responsiveHeight(7),
    borderBottomWidth: 0.2,
    borderBottomColor: THEME_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: responsiveFontSize(2),
    fontWeight: '800',
    marginTop: responsiveHeight(3),
    alignSelf: 'center',
    color: THEME_COLOR,
  },
});
