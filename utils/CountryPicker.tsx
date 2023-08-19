import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

const CountryPickerComponent = ({ onSelectCountry }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        onSelectCountry(country);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Country Picker</Text>
            <CountryPicker
                onSelect={handleCountrySelect}
                withFilter
                withFlag
                withCountryNameButton
                withAlphaFilter
                countryCode={selectedCountry ? selectedCountry.cca2 : ''}
            />
            {selectedCountry && (
                <Text style={styles.selectedCountryText}>
                    Selected Country: {selectedCountry.name.common}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        flexDirection:'row',
        width:'100%'
    },
    header: {
        fontSize: 12,
    },
    selectedCountryText: {
        fontSize: 12,
    },
});

export default CountryPickerComponent;
