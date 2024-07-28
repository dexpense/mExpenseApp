import {StyleSheet, Switch, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

const Test = () => {
  const [transactionType, setTransactionType] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      setTransactionType('Debit');
    } else {
      setTransactionType('Credit');
    }
  };
  const isObjectEmpty = objectName => {
    return (
      objectName &&
      Object.keys(objectName).length === 0 &&
      objectName.constructor === Object
    );
  };
  useEffect(() => {
    console.log(transactionType);
  }, [transactionType]);
  return (
    <View>
      <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
        <Text>Debit</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text>Credit</Text>
      </View>
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({});
