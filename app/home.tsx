import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const Home: React.FC = () => {
    const [isScanComplete, setIsScanComplete] = useState(false);
    const [isReviewComplete, setIsReviewComplete] = useState(false);

    const handleScanBallot = () => {
        // Trigger navigation to the scan page or scan functionality here
        // Simulate a successful video upload
        Alert.alert("Scan Ballot", "Video uploaded successfully.");
        setIsScanComplete(true);
    };

    const handleReviewBallot = () => {
        // Trigger navigation to the review page or review functionality here
        Alert.alert("Review Ballot", "Review acknowledged.");
        setIsReviewComplete(true);
    };

    const handlePublishBallot = () => {
        // Trigger publishing action here
        Alert.alert("Publish Ballot", "Ballot has been published.");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleScanBallot}>
                <Text style={styles.buttonText}>Scan Ballot</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, !isScanComplete && styles.disabledButton]}
                onPress={handleReviewBallot}
                disabled={!isScanComplete}
            >
                <Text style={styles.buttonText}>Review Ballot</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, (!isScanComplete || !isReviewComplete) && styles.disabledButton]}
                onPress={handlePublishBallot}
                disabled={!isScanComplete || !isReviewComplete}
            >
                <Text style={styles.buttonText}>Publish Ballot</Text>
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
