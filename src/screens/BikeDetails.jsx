import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Alert,
  Switch,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';
import {
  round2dec,
  getDay,
  getFullYear,
  getMonthName,
  IndianFormat,
} from '../modules/calculatefunctions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import {useGlobalContext} from '../context/Store';
import BottomBar from './BottomBar';
const BikeDetails = () => {
  const {
    state,
    stateObject,
    setStateObject,
    vehicleState,
    setVehicleState,
    fuelingState,
    setFuelingState,
    transactionState,
    setTransactionState,
    accountState,
    setAccountState,
  } = useGlobalContext();

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [data, setData] = useState(stateObject);

  const docId = uuid.v4();
  const [isclicked, setIsclicked] = useState(false);
  const [showData, setShowData] = useState(false);

  const [serviceDone, setServiceDone] = useState(false);
  const [oilRun, setOilRun] = useState('');
  const [showFuelAdd, setShowFuelAdd] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [addBtnClicked, setAddBtnClicked] = useState(false);
  const [allFueling, setAllFueling] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [showLoader, setShowLoader] = useState(false);

  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [othersAccount, setOthersAccount] = useState({
    date: Date.now(),
    id: 'deviceDefaultAccount',
    accountName: 'OTHER',
    accountType: 'Cash',
    amount: 0,
    recentTransaction: 0,
    addedBy: state.USER.id,
  });
  const calculateAgeOnSameDay = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setOpen('');
    setDate(currentSelectedDate);
    setFontColor('black');
  };

  const [transferingAdmin, setTransferingAdmin] = useState({});
  const [totalFuelCost, setTotalFuelCost] = useState('');
  const [totalFuelBuyed, setTotalFuelBuyed] = useState('');
  const [petrolPrice, setPetrolPrice] = useState('104.95');
  const [volume, setVolume] = useState(0);
  const [amount, setAmount] = useState(0);

  const [serviceCost, SetServiceCost] = useState('');
  const [servicedAtDistance, setServicedAtDistance] = useState('');
  const [totalRun, setTotalRun] = useState(
    parseInt(data.totalRun + data.petrolAdded * data.milage),
  );
  const [visibleItems, setVisibleItems] = useState(5);
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 5);
  };

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      if (oilRun !== '') {
        setOilRun('');
      }
    }
  };

  const submitData = async () => {
    if (petrolPrice > 0 && volume > 0 && amount > 0 && totalRun > 0) {
      setShowLoader(true);
      const milage = parseInt(
        (parseInt(totalRun) - data.totalRun) / parseFloat(data.petrolAdded),
      );
      const calculatedFuelingDistance = parseInt(
        parseInt(data.totalRun) +
          parseFloat(data.petrolAdded) * parseInt(data.milage),
      );
      await firestore()
        .collection('fueling')
        .doc(docId)
        .set({
          date: Date.parse(date),
          id: docId,
          bikeName: data.bikeName,
          bikeID: data.id,
          addedBy: data.addedBy,
          petrolPrice: parseFloat(petrolPrice),
          purchasedFrom: transferingAdmin.accountName,
          accountID: transferingAdmin.id,
          prevRun: data.totalRun,
          volume: parseFloat(volume),
          amount: parseFloat(amount),
          totalRun: parseInt(totalRun),
          milageGot: milage,
          calculatedFuelingDistance: calculatedFuelingDistance,
        })
        .then(async () => {
          const x = [
            ...fuelingState,
            {
              date: Date.parse(date),
              id: docId,
              bikeName: data.bikeName,
              bikeID: data.id,
              addedBy: data.addedBy,
              petrolPrice: parseFloat(petrolPrice),
              purchasedFrom: transferingAdmin.accountName,
              accountID: transferingAdmin.id,
              prevRun: data.totalRun,
              volume: parseFloat(volume),
              amount: parseFloat(amount),
              totalRun: parseInt(totalRun),
              milageGot: milage,
              calculatedFuelingDistance: calculatedFuelingDistance,
            },
          ].sort((a, b) => b.date - a.date);
          setFuelingState(x);
          setAllFueling(x.filter(el => el.bikeID === data.id));
          await firestore()
            .collection('bikes')
            .doc(data.id)
            .update({
              date: Date.parse(date),
              milage: milage,
              totalRun: parseInt(totalRun),
              petrolAdded: parseFloat(volume),
            })
            .then(async () => {
              const exceptTargetVehile = vehicleState.filter(
                vehicle => vehicle.id !== data.id,
              );
              const thisVehicle = vehicleState.filter(
                vehicle => vehicle.id === data.id,
              )[0];
              thisVehicle.totalRun = parseInt(totalRun);
              thisVehicle.petrolAdded = parseFloat(volume);
              thisVehicle.date = Date.now();
              thisVehicle.milage = milage;

              const x = [...exceptTargetVehile, thisVehicle].sort(
                (a, b) => b.date - a.date,
              );
              setVehicleState(x);

              if (transferingAdmin.id !== 'deviceDefaultAccount') {
                await firestore()
                  .collection('accounts')
                  .doc(transferingAdmin.id)
                  .update({
                    amount:
                      parseFloat(transferingAdmin.amount) - parseFloat(amount),
                    date: Date.parse(date),
                    recentTransaction: parseFloat(amount),
                  });
                const exceptTransferingAccount = accountState.filter(
                  item => item.id === transferingAdmin.id,
                );
                const thisTransferingAccount = accountState.filter(
                  item => item.id === transferingAdmin.id,
                )[0];
                thisTransferingAccount.amount =
                  parseFloat(transferingAdmin.amount) - parseFloat(amount);
                thisTransferingAccount.date = Date.parse(date);
                thisTransferingAccount.recentTransaction = parseFloat(amount);
                setAccountState(
                  [...exceptTransferingAccount, thisTransferingAccount].sort(
                    (a, b) => b.date - a.date,
                  ),
                );
                setAllAccounts(
                  [...exceptTransferingAccount, thisTransferingAccount].sort(
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
                    addedBy: transferingAdmin.addedBy,
                    amount: parseFloat(amount),
                    purpose: 'Fueling',
                    transactionType: 'Debit',
                    previousAmount: parseFloat(transferingAdmin.amount),
                    currentAmount:
                      parseFloat(transferingAdmin.amount) - parseFloat(amount),
                  });
                setTransactionState([
                  ...transactionState,
                  {
                    date: Date.parse(date),
                    id: docId,
                    accountName: transferingAdmin.accountName,
                    accountID: transferingAdmin.id,
                    addedBy: transferingAdmin.addedBy,
                    amount: parseFloat(amount),
                    purpose: 'Fueling',
                    transactionType: 'Debit',
                    previousAmount: parseFloat(transferingAdmin.amount),
                    currentAmount:
                      parseFloat(transferingAdmin.amount) - parseFloat(amount),
                  },
                ]);
              }
              setShowLoader(false);
              setData(thisVehicle);
              setStateObject(thisVehicle);
              setShowFuelAdd(!showFuelAdd);
              setAddBtnClicked(false);
              setTransferingAdmin(allAccounts);
              setVolume('0');
              setAmount('0');
              setDate(new Date());
              showToast('success', 'Data Added Successfully');
              // setTimeout(() => navigation.navigate('Home'), 1500);
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', e);
            });
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', e);
        });
    } else {
      showToast('error', 'Invalid Data');
    }
  };

  const getAccounts = async () => {
    setShowLoader(true);
    const userID = JSON.parse(await EncryptedStorage.getItem('user')).id;
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
        setShowLoader(false);
        setAllAccounts(newData);
        setAccountState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const getFueling = async () => {
    setShowLoader(true);
    const vehiclesFueling = fuelingState.filter(
      el => el.bikeID === stateObject.id,
    );
    let newData = vehiclesFueling.sort((a, b) => b.date - a.date);
    let cost = 0;
    let fuel = 0;
    newData.map(el => {
      cost = cost + el.amount;
      return cost;
    });
    newData.map(el => {
      fuel = fuel + el.volume;
      return fuel;
    });
    setTotalFuelCost(cost);
    setTotalFuelBuyed(fuel);
    setShowLoader(false);
    setAllFueling(newData);
  };
  const getTransactions = async () => {
    setShowLoader(true);
    await firestore()
      .collection('transactions')
      .where('addedBy', '==', state.USER.id)
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

  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This Fueling?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Fueling Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          deleteData(el);
        },
      },
    ]);
  };

  const deleteData = async targetFueling => {
    try {
      setShowLoader(true);
      const prevFueling = allFueling[1];
      const date =
        allFueling.length > 1 ? prevFueling.date : stateObject.FirstDate;
      const milage =
        allFueling.length > 1 ? prevFueling.milageGot : stateObject.FirstMilage;
      const totalRun =
        allFueling.length > 1
          ? prevFueling.totalRun
          : stateObject.FirstTotalRun;
      const petrolAdded =
        allFueling.length > 1
          ? prevFueling.volume
          : stateObject.FirstPetrolAdded;
      console.log(date);
      await firestore()
        .collection('bikes')
        .doc(data.id)
        .update({
          date: date,
          milage: milage,
          totalRun: totalRun,
          petrolAdded: petrolAdded,
        })
        .then(async () => {
          const exceptThisVehicle = vehicleState.filter(
            item => item.id !== data.id,
          );
          const thisVehicle = vehicleState.filter(
            item => item.id === data.id,
          )[0];
          thisVehicle.date = date;
          thisVehicle.milage = milage;
          thisVehicle.totalRun = totalRun;
          thisVehicle.petrolAdded = petrolAdded;

          setVehicleState([...exceptThisVehicle, thisVehicle]);
          if (targetFueling.accountID !== 'deviceDefaultAccount') {
            let targetAccount = allAccounts.filter(
              item => targetFueling.accountID === item.id,
            )[0];
            const secondTransaction = transactionState
              .filter(
                transaction =>
                  transaction.accountID === targetFueling.accountID,
              )
              .filter(item => targetFueling.id !== item.id)[1];
            console.log(secondTransaction);
            await firestore()
              .collection('accounts')
              .doc(targetAccount.id)
              .update({
                amount:
                  parseFloat(targetAccount.amount) +
                  parseFloat(targetFueling.amount),
                date: secondTransaction.date,
              })
              .then(async () => {
                const exceptThisAccount = accountState.filter(
                  item => item.id !== targetAccount.id,
                );
                const thisAccount = accountState.filter(
                  item => item.id === targetAccount.id,
                )[0];
                thisAccount.amount =
                  parseFloat(targetAccount.amount) +
                  parseFloat(targetFueling.amount);
                thisAccount.date = secondTransaction.date;
                setAccountState(
                  [...exceptThisAccount, thisAccount].sort(
                    (a, b) => b.date - a.date,
                  ),
                );
                setAllAccounts(
                  [...exceptThisAccount, thisAccount].sort(
                    (a, b) => b.date - a.date,
                  ),
                );
                await firestore()
                  .collection('transactions')
                  .doc(targetFueling.id)
                  .delete()
                  .then(async () => {
                    setTransactionState(
                      transactionState.filter(
                        item => item.id !== targetFueling.id,
                      ),
                    );
                    await firestore()
                      .collection('fueling')
                      .doc(targetFueling.id)
                      .delete()
                      .then(async () => {
                        setFuelingState(
                          fuelingState.filter(
                            item => item.id !== targetFueling.id,
                          ),
                        );
                        setData(thisVehicle);
                        setStateObject(thisVehicle);
                        setShowLoader(false);
                        showToast('success', 'Data Deleted Successfully');
                        // setTimeout(() => navigation.navigate('Home'), 1500);
                      })
                      .catch(e => {
                        setShowLoader(false);
                        showToast('error', e);
                        console.log(e);
                      });
                  });
              })
              .catch(e => {
                setShowLoader(false);
                showToast('error', e);
                console.log(e, 'Here is the error message');
              });
          } else {
            await firestore()
              .collection('fueling')
              .doc(targetFueling.id)
              .delete()
              .then(async () => {
                setFuelingState(
                  fuelingState.filter(item => item.id !== targetFueling.id),
                );
                setAllFueling(
                  fuelingState.filter(item => item.id !== targetFueling.id),
                );
                setData(thisVehicle);
                setStateObject(thisVehicle);
                setShowLoader(false);
                showToast('success', 'Data Deleted Successfully');
                // setTimeout(() => navigation.navigate('Home'), 1500);
              })
              .catch(e => {
                setShowLoader(false);
                showToast('error', e);
                console.log(e, 'Here is the error message');
              });
          }
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', e);
          console.log(e);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const addService = async () => {
    setShowLoader(true);

    if (transferingAdmin.id !== 'deviceDefaultAccount') {
      await firestore()
        .collection('accounts')
        .doc(transferingAdmin.id)
        .update({
          amount: parseFloat(transferingAdmin.amount) - parseFloat(serviceCost),
          date: Date.parse(date),
          recentTransaction: parseFloat(serviceCost),
        })
        .then(async () => {
          const exceptTransferingAccount = accountState.filter(
            item => item.id !== transferingAdmin.id,
          );
          const thisTransferingAccount = accountState.filter(
            item => item.id === transferingAdmin.id,
          )[0];
          thisTransferingAccount.amount =
            parseFloat(transferingAdmin.amount) - parseFloat(serviceCost);
          thisTransferingAccount.date = Date.parse(date);
          thisTransferingAccount.recentTransaction = parseFloat(serviceCost);

          setAccountState(
            [...exceptTransferingAccount, thisTransferingAccount].sort(
              (a, b) => b.date - a.date,
            ),
          );
          setAllAccounts(
            [...exceptTransferingAccount, thisTransferingAccount].sort(
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
              addedBy: transferingAdmin.addedBy,
              amount: parseFloat(serviceCost),
              purpose: 'Vehicle Service',
              transactionType: 'Debit',
              previousAmount: parseFloat(transferingAdmin.amount),
              currentAmount:
                parseFloat(transferingAdmin.amount) - parseFloat(serviceCost),
            })
            .then(async () => {
              setTransactionState(
                [
                  ...transactionState,
                  {
                    date: Date.parse(date),
                    id: docId,
                    accountName: transferingAdmin.accountName,
                    accountID: transferingAdmin.id,
                    addedBy: transferingAdmin.addedBy,
                    amount: parseFloat(serviceCost),
                    purpose: 'Vehicle Service',
                    transactionType: 'Debit',
                    previousAmount: parseFloat(transferingAdmin.amount),
                    currentAmount:
                      parseFloat(transferingAdmin.amount) -
                      parseFloat(serviceCost),
                  },
                ].sort((a, b) => b.date - a.date),
              );
              if (isEnabled) {
                await firestore()
                  .collection('bikes')
                  .doc(data.id)
                  .update({
                    servicedAtDistance: parseInt(servicedAtDistance),
                    serviceCost: parseFloat(serviceCost),
                    serviceDate: Date.parse(date),
                    oilChangedAt: parseInt(servicedAtDistance),
                    nextOilChangeDistance:
                      parseInt(servicedAtDistance) + parseInt(oilRun),
                  })
                  .then(async () => {
                    const exceptThisVehicle = vehicleState.filter(
                      item => item.id !== data.id,
                    );
                    const thisVehicle = vehicleState.filter(
                      item => item.id === data.id,
                    )[0];
                    thisVehicle.servicedAtDistance =
                      parseInt(servicedAtDistance);
                    thisVehicle.serviceCost = parseFloat(serviceCost);
                    thisVehicle.serviceDate = Date.parse(date);
                    thisVehicle.oilChangedAt = parseInt(servicedAtDistance);
                    thisVehicle.nextOilChangeDistance = parseInt(oilRun);
                    setVehicleState(
                      [...exceptThisVehicle, thisVehicle].sort(
                        (a, b) => b.date - a.date,
                      ),
                    );
                    setData(thisVehicle);
                    setStateObject(thisVehicle);
                    setServiceDone(false);
                    setAddBtnClicked(false);
                    setIsEnabled(false);
                    setTransferingAdmin(allAccounts);
                    setServicedAtDistance('');
                    SetServiceCost('');
                    setDate(new Date());
                    setShowLoader(false);
                    showToast('success', 'Data Added Successfully');
                    // setTimeout(() => navigation.navigate('Home'), 1500);
                  })
                  .catch(e => {
                    setShowLoader(false);
                    showToast('error', e);
                  });
              } else {
                await firestore()
                  .collection('bikes')
                  .doc(data.id)
                  .update({
                    servicedAtDistance: parseInt(servicedAtDistance),
                    serviceCost: parseFloat(serviceCost),
                    serviceDate: Date.parse(date),
                  })
                  .then(async () => {
                    const exceptThisVehicle = vehicleState.filter(
                      item => item.id !== data.id,
                    );
                    const thisVehicle = vehicleState.filter(
                      item => item.id === data.id,
                    )[0];
                    thisVehicle.servicedAtDistance =
                      parseInt(servicedAtDistance);
                    thisVehicle.serviceCost = parseFloat(serviceCost);
                    thisVehicle.serviceDate = Date.parse(date);
                    setVehicleState(
                      [...exceptThisVehicle, thisVehicle].sort(
                        (a, b) => b.date - a.date,
                      ),
                    );
                    setData(thisVehicle);
                    setStateObject(thisVehicle);
                    setServiceDone(false);
                    setAddBtnClicked(false);
                    setIsEnabled(false);
                    setTransferingAdmin(allAccounts);
                    setServicedAtDistance('');
                    SetServiceCost('');
                    setDate(new Date());
                    setShowLoader(false);
                    showToast('success', 'Data Added Successfully');
                    // setTimeout(() => navigation.navigate('Home'), 1500);
                  })
                  .catch(e => {
                    setShowLoader(false);
                    showToast('error', e);
                  });
              }
            });
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', e);
        });
    } else {
      if (isEnabled) {
        await firestore()
          .collection('bikes')
          .doc(data.id)
          .update({
            servicedAtDistance: parseInt(servicedAtDistance),
            serviceCost: parseFloat(serviceCost),
            serviceDate: Date.parse(date),
            oilChangedAt: parseInt(servicedAtDistance),
            nextOilChangeDistance:
              parseInt(servicedAtDistance) + parseInt(oilRun),
          })
          .then(async () => {
            const exceptThisVehicle = vehicleState.filter(
              item => item.id !== data.id,
            );
            const thisVehicle = vehicleState.filter(
              item => item.id === data.id,
            )[0];
            thisVehicle.servicedAtDistance = parseInt(servicedAtDistance);
            thisVehicle.serviceCost = parseFloat(serviceCost);
            thisVehicle.serviceDate = Date.parse(date);
            thisVehicle.oilChangedAt = parseInt(servicedAtDistance);
            thisVehicle.nextOilChangeDistance =
              parseInt(servicedAtDistance) + parseInt(oilRun);
            setVehicleState(
              [...exceptThisVehicle, thisVehicle].sort(
                (a, b) => b.date - a.date,
              ),
            );
            setServiceDone(false);
            setAddBtnClicked(false);
            setIsEnabled(false);
            setTransferingAdmin(allAccounts);
            setServicedAtDistance('');
            SetServiceCost('');
            setDate(new Date());
            setShowLoader(false);
            showToast('success', 'Data Added Successfully');
            // setTimeout(() => navigation.navigate('Home'), 1500);
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', e);
          });
      } else {
        await firestore()
          .collection('bikes')
          .doc(data.id)
          .update({
            servicedAtDistance: parseInt(servicedAtDistance),
            serviceCost: parseFloat(serviceCost),
            serviceDate: Date.parse(date),
          })
          .then(async () => {
            const exceptThisVehicle = vehicleState.filter(
              item => item.id !== data.id,
            );
            const thisVehicle = vehicleState.filter(
              item => item.id === data.id,
            )[0];
            thisVehicle.servicedAtDistance = parseInt(servicedAtDistance);
            thisVehicle.serviceCost = parseFloat(serviceCost);
            thisVehicle.serviceDate = Date.parse(date);
            setVehicleState(
              [...exceptThisVehicle, thisVehicle].sort(
                (a, b) => b.date - a.date,
              ),
            );
            setServiceDone(false);
            setAddBtnClicked(false);
            setIsEnabled(false);
            setTransferingAdmin(allAccounts);
            setServicedAtDistance('');
            SetServiceCost('');
            setDate(new Date());
            setShowLoader(false);
            showToast('success', 'Data Added Successfully');
            // setTimeout(() => navigation.navigate('Home'), 1500);
            setData(thisVehicle);
            setStateObject(thisVehicle);
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', e);
          });
      }
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
  useEffect(() => {
    getFueling();
    if (accountState.length === 0) {
      getAccounts();
    } else {
      setAllAccounts(accountState.sort((a, b) => b.date - a.date));
    }
    if (transactionState.length === 0) {
      getTransactions();
    }
  }, [isFocused]);
  useEffect(() => {}, [
    petrolPrice,
    volume,
    amount,
    totalRun,
    allFueling,
    data,
  ]);

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{marginBottom: responsiveHeight(8)}}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Image
            source={
              data.milage > 30
                ? require('../images/bike.png')
                : require('../images/car.png')
            }
            style={styles.bikeImage}
          />

          <View style={styles.details}>
            <Text style={styles.specText}>
              {data.bikeName.toUpperCase().slice(0, 15)}
            </Text>
            <Text style={styles.specText}>
              Total Run: {parseInt(data.totalRun)} KM
            </Text>
            <Text style={styles.specText}>Milage: {data.milage} KM/Ltr</Text>
            <Text style={styles.specText}>Fulled: {data.petrolAdded} Ltr</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Text style={styles.specText}>
                Fulled On: {getDay(data.date)}
              </Text>
              <Text style={styles.specText}> {getMonthName(data.date)}</Text>
              <Text style={styles.specText}> {getFullYear(data.date)}</Text>
            </View>
            <Text style={styles.specText}>
              Next Fuel:{' '}
              {parseInt(
                parseInt(data.totalRun) +
                  parseFloat(data.petrolAdded) * parseInt(data.milage),
              )}{' '}
              KM
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Text style={styles.specText}>
                Serviced On: {getDay(data.serviceDate)}
              </Text>
              <Text style={styles.specText}>
                {' '}
                {getMonthName(data.serviceDate)}
              </Text>
              <Text style={styles.specText}>
                {' '}
                {getFullYear(data.serviceDate)}
              </Text>
            </View>
            <Text style={styles.specText}>
              Service Cost: ₹{IndianFormat(data.serviceCost)}
            </Text>
            <Text style={styles.specText}>
              Oil Changed At: {data.oilChangedAt} KM
            </Text>
            <Text style={styles.specText}>
              Next Oil Change At: {data.nextOilChangeDistance} KM
            </Text>
            {totalFuelBuyed > 0 ? (
              <Text style={styles.specText}>
                Total Fuel Buyed: {round2dec(totalFuelBuyed)} Ltr
              </Text>
            ) : null}
            {totalFuelCost > 0 ? (
              <Text style={styles.specText}>
                Total Spent: ₹{IndianFormat(totalFuelCost)}
              </Text>
            ) : null}
          </View>

          {showFuelAdd && addBtnClicked && (
            <ScrollView>
              <Text style={styles.title}>Add Fuel</Text>
              <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <View>
                  <Text style={styles.label}>Fuel Price</Text>
                  <CustomTextInput
                    placeholder={'Petrol Price'}
                    type={'number-pad'}
                    size={'small'}
                    value={petrolPrice.toString()}
                    onChangeText={text => {
                      if (!isNaN(amount) || !isNaN(volume)) {
                        setAmount(
                          round2dec(parseFloat(text) * parseFloat(volume)),
                        );
                      } else if (text === 0 || text === '') {
                        setVolume(0);
                        setAmount(0);
                      } else if (volume === 0 || volume === 0) {
                        setAmount(0);
                      } else {
                        setVolume(0);
                        setAmount(0);
                      }
                      setPetrolPrice(text);
                    }}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Fuel Volume</Text>
                  <CustomTextInput
                    placeholder={'Volume'}
                    type={'number-pad'}
                    size={'small'}
                    value={volume.toString()}
                    onChangeText={text => {
                      setAmount(
                        round2dec(parseFloat(petrolPrice) * parseFloat(text)),
                      );
                      if (isNaN(text)) {
                        setAmount(0);
                      }
                      setVolume(text);
                    }}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Fuel Cost</Text>
                  <CustomTextInput
                    placeholder={'Amout'}
                    type={'number-pad'}
                    size={'small'}
                    value={amount.toString()}
                    onChangeText={text => {
                      if (petrolPrice) {
                        setVolume(
                          round2dec(parseFloat(text) / parseFloat(petrolPrice)),
                        );
                      } else if (text === 0 || text === '') {
                        setVolume(0);
                      }
                      setAmount(text);
                    }}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Current Run</Text>
                  <CustomTextInput
                    placeholder={'Current Run'}
                    type={'number-pad'}
                    size={'small'}
                    value={totalRun.toString()}
                    onChangeText={text => setTotalRun(text)}
                  />
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.heading,
                    {textAlign: 'center', fontSize: 15, marginTop: 5},
                  ]}>
                  Select From Which Account To Buy
                </Text>

                <TouchableOpacity
                  style={[styles.dropDownnSelector, {marginTop: 5}]}
                  onPress={() => {
                    setIsclicked(!isclicked);
                    setTransferingAdmin(allAccounts);
                    setShowData(!showData);
                  }}>
                  <Text style={styles.dropDownText}>
                    {transferingAdmin.accountName}
                  </Text>

                  {isclicked ? (
                    <AntDesign name="up" size={30} color={THEME_COLOR} />
                  ) : (
                    <AntDesign name="down" size={30} color={THEME_COLOR} />
                  )}
                </TouchableOpacity>
                {isclicked ? (
                  <View style={styles.dropDowArea}>
                    {allAccounts.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.AdminName}
                          onPress={() => {
                            setTransferingAdmin(item);
                            setIsclicked(false);
                            setShowData(true);
                          }}>
                          <Text style={styles.dropDownText}>
                            {item.accountName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={styles.AdminName}
                      onPress={() => {
                        setTransferingAdmin(othersAccount);
                        setIsclicked(false);
                        setShowData(true);
                      }}>
                      <Text style={styles.dropDownText}>
                        {othersAccount.accountName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {showData ? (
                  transferingAdmin.accountName ? (
                    <View
                      style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        alignSelf: 'center',
                      }}>
                      <Text style={styles.dropDownText}>Balance: </Text>
                      <Text style={styles.dropDownText}>
                        ₹{IndianFormat(transferingAdmin.amount)}
                      </Text>
                    </View>
                  ) : null
                ) : null}
              </View>
              <View>
                <Text style={styles.label}>Enter Fueling Date</Text>
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
                    {date.getDate() < 10 ? 0 + date.getDate() : date.getDate()}-
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
                    minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
                    display="default"
                    onChange={calculateAgeOnSameDay}
                  />
                )}
              </View>
              <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <CustomButton
                  title={'Submit'}
                  size={'small'}
                  onClick={submitData}
                />
                <CustomButton
                  title={'Cancel'}
                  color={'darkred'}
                  size={'small'}
                  onClick={() => {
                    setShowFuelAdd(!showFuelAdd);
                    setAddBtnClicked(false);
                    setTransferingAdmin(allAccounts);
                  }}
                />
              </View>
            </ScrollView>
          )}
          {serviceDone && addBtnClicked && (
            <ScrollView style={{marginBottom: responsiveHeight(2)}}>
              <Text style={styles.title}>Add Service</Text>

              <View style={{alignSelf: 'center'}}>
                <Text style={styles.serviceText}>Engine Oil Changed</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    marginTop: responsiveHeight(1),
                    marginBottom: responsiveHeight(1),
                  }}>
                  <Text
                    style={[
                      styles.serviceText,
                      {paddingRight: responsiveWidth(1.5)},
                    ]}>
                    No
                  </Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                  />
                  <Text
                    style={[
                      styles.serviceText,
                      {paddingLeft: responsiveWidth(1.5)},
                    ]}>
                    Yes
                  </Text>
                </View>
                {isEnabled && (
                  <View>
                    <Text style={styles.serviceText}>
                      Estimated Oil Change Distance e.g. 2500 or 1000
                    </Text>
                    <CustomTextInput
                      placeholder={'Estimated Oil Validity In KM'}
                      type={'number-pad'}
                      value={oilRun}
                      onChangeText={text => setOilRun(text)}
                    />
                  </View>
                )}
                <View>
                  <Text style={styles.serviceText}>Service Cost</Text>
                  <CustomTextInput
                    placeholder={'Service Cost'}
                    type={'number-pad'}
                    value={serviceCost}
                    onChangeText={text => {
                      SetServiceCost(text);
                    }}
                  />
                </View>
                <View>
                  <Text style={styles.serviceText}>Current Run</Text>
                  <CustomTextInput
                    placeholder={'Current Run'}
                    type={'number-pad'}
                    value={servicedAtDistance}
                    onChangeText={text => setServicedAtDistance(text)}
                  />
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.heading,
                    {textAlign: 'center', fontSize: 15, marginTop: 5},
                  ]}>
                  Select From Which Account To Pay
                </Text>

                <TouchableOpacity
                  style={[styles.dropDownnSelector, {marginTop: 5}]}
                  onPress={() => {
                    setIsclicked(!isclicked);
                    setTransferingAdmin(allAccounts);
                    setShowData(!showData);
                  }}>
                  <Text style={styles.dropDownText}>
                    {transferingAdmin.accountName}
                  </Text>

                  {isclicked ? (
                    <AntDesign name="up" size={30} color={THEME_COLOR} />
                  ) : (
                    <AntDesign name="down" size={30} color={THEME_COLOR} />
                  )}
                </TouchableOpacity>
                {isclicked ? (
                  <View style={styles.dropDowArea}>
                    {allAccounts.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.AdminName}
                          onPress={() => {
                            setTransferingAdmin(item);
                            setIsclicked(false);
                            setShowData(true);
                          }}>
                          <Text style={styles.dropDownText}>
                            {item.accountName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={styles.AdminName}
                      onPress={() => {
                        setTransferingAdmin(othersAccount);
                        setIsclicked(false);
                        setShowData(true);
                      }}>
                      <Text style={styles.dropDownText}>
                        {othersAccount.accountName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {showData ? (
                  transferingAdmin.accountName ? (
                    <View
                      style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        alignSelf: 'center',
                      }}>
                      <Text style={styles.dropDownText}>Balance: </Text>
                      <Text style={styles.dropDownText}>
                        ₹{IndianFormat(transferingAdmin.amount)}
                      </Text>
                    </View>
                  ) : null
                ) : null}
              </View>
              <View>
                <Text style={styles.serviceText}>Enter Fueling Date</Text>
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
                    {date.getDate() < 10 ? 0 + date.getDate() : date.getDate()}-
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
                    minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
                    display="default"
                    onChange={calculateAgeOnSameDay}
                  />
                )}
              </View>
              <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <CustomButton
                  title={'Submit'}
                  size={'small'}
                  onClick={addService}
                />
                <CustomButton
                  title={'Cancel'}
                  color={'darkred'}
                  size={'small'}
                  onClick={() => {
                    setServiceDone(false);
                    setAddBtnClicked(false);
                    setIsEnabled(false);
                    setTransferingAdmin(allAccounts);
                    setServicedAtDistance('');
                    SetServiceCost('');
                    setDate(new Date());
                  }}
                />
              </View>
            </ScrollView>
          )}
        </View>
        {!addBtnClicked && (
          <View
            style={{
              margin: responsiveHeight(1),

              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
            }}>
            <CustomButton
              title={'Add Fuel'}
              size={'small'}
              fontSize={17}
              onClick={() => {
                setShowFuelAdd(true);
                setAddBtnClicked(true);
              }}
            />

            <CustomButton
              title={'Add Service'}
              color={'blueviolet'}
              size={'small'}
              fontSize={14}
              onClick={() => {
                setServiceDone(!serviceDone);
                setAddBtnClicked(true);
              }}
            />
          </View>
        )}

        {!addBtnClicked && (
          <ScrollView style={{marginBottom: responsiveHeight(2)}}>
            {allFueling.length > 0
              ? allFueling.slice(0, visibleItems).map((el, ind) => {
                  return (
                    <ScrollView
                      style={styles.itemView}
                      key={ind}
                      contentContainerStyle={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',

                          flexWrap: 'wrap',
                          paddingLeft: responsiveWidth(15),
                        }}>
                        <Text style={styles.label}>
                          Previous Fuelled at Distance: {el.prevRun} KM
                        </Text>
                        <Text style={styles.label}>
                          Calculated Fueling Distance:
                          {el.calculatedFuelingDistance} KM
                        </Text>
                        <Text style={styles.label}>
                          Vehicle Fuled At: {el.totalRun} KM
                        </Text>
                        <Text style={styles.label}>
                          Milage: {el.milageGot} KM/Ltr
                        </Text>
                        <Text style={styles.label}>
                          Last Fuelled: {el.volume} Ltr
                        </Text>
                        <Text style={styles.label}>
                          Fuelling Amount: ₹{el.amount}
                        </Text>
                        <Text style={styles.label}>
                          Fuelling Account: {el.purchasedFrom}
                        </Text>
                        {ind === 0 && (
                          <Text style={styles.label}>
                            Next Fuel:{' '}
                            {parseInt(
                              parseInt(el.totalRun) +
                                parseFloat(el.volume) * parseInt(el.milageGot),
                            )}{' '}
                            KM
                          </Text>
                        )}
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
                          paddingRight: responsiveWidth(5),
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            showConfirmDialog(el);
                          }}>
                          <Text>
                            <Ionicons name="trash-bin" size={30} color="red" />
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  );
                })
              : null}
            {visibleItems < allFueling.length && (
              <CustomButton title={'Show More'} onClick={loadMore} />
            )}
          </ScrollView>
        )}
      </ScrollView>
      <BottomBar />
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default BikeDetails;

const styles = StyleSheet.create({
  details: {
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: responsiveHeight(1),
    right: responsiveWidth(2),
    backgroundColor: 'rgba(255, 255, 255,.7)',
    padding: responsiveWidth(2),
    borderRadius: responsiveWidth(2),
    marginBottom: responsiveHeight(2),
  },
  specText: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '800',
    color: THEME_COLOR,
    // color: 'white',
    shadowColor: 'black',
    elevation: 5,
    shadowOpacity: 1,
  },
  bikeImage: {
    width: responsiveWidth(100),
    height: responsiveHeight(30),
    borderRadius: 10,
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    paddingLeft: responsiveWidth(2),
    color: THEME_COLOR,
    marginTop: responsiveHeight(2),
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(94),
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: responsiveWidth(2),
    shadowColor: 'black',
    elevation: 5,
  },
  dropDownnSelector: {
    width: responsiveWidth(94),
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
    width: responsiveWidth(94),

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
  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
  heading: {
    fontSize: responsiveFontSize(2),
    fontWeight: '800',
    marginTop: responsiveHeight(3),
    alignSelf: 'center',
    color: THEME_COLOR,
  },
  serviceText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500',
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
});
