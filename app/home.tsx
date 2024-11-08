import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './_layout';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
    const [isScanComplete, setIsScanComplete] = useState(false);
    const [isReviewComplete, setIsReviewComplete] = useState(false);
    const navigation = useNavigation<HomeScreenNavigationProp>();


    const handleScanTape = () => {
        // Trigger navigation to the scan page or scan functionality here
        // Simulate a successful video upload
        // Alert.alert("Scan Poll Tape", "Video uploaded successfully.");
        navigation.navigate("Camera");
        // setIsScanComplete(true);
    };

    const handleReviewTape = () => {
        // Trigger navigation to the review page or review functionality here
        Alert.alert("Review Poll Tape", "Review acknowledged.");
        setIsReviewComplete(true);
    };

    const handlePublishTape = () => {
        // Trigger publishing action here
        Alert.alert("Publish Poll Tape", "Poll Tape has been published.");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleScanTape}>
                <Text style={styles.buttonText}>Scan Poll Tape</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, !isScanComplete && styles.disabledButton]}
                onPress={handleReviewTape}
                disabled={!isScanComplete}
            >
                <Text style={styles.buttonText}>Review Poll Tape</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, (!isScanComplete || !isReviewComplete) && styles.disabledButton]}
                onPress={handlePublishTape}
                disabled={!isScanComplete || !isReviewComplete}
            >
                <Text style={styles.buttonText}>Publish Poll Tape</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 10,
    },
    disabledButton: {
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Home;
