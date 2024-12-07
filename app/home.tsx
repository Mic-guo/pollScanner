import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './_layout';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import sampleData from '../Grand_Blanc_Township.json'; // Import the JSON data

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
    const [isScanComplete, setIsScanComplete] = useState(false);
    const [isReviewComplete, setIsReviewComplete] = useState(false);
    const [pollTapeData, setPollTapeData] = useState<any>(null);
    const navigation = useNavigation<HomeScreenNavigationProp>();

    // Load `sampleData` on component mount
    // TODO: Remove Test Code
    useEffect(() => {
        setPollTapeData(sampleData);
        console.log("Poll tape data initialized with sample data:", sampleData);
    }, []);

    const handleScanTape = () => {
        // Trigger navigation to the scan page or scan functionality here
        // Simulate a successful video upload
        // Alert.alert("Scan Poll Tape", "Video uploaded successfully.");
        navigation.navigate("Camera");
        // setIsScanComplete(true);
    };

    const handleUploadTape = async () => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Please allow access to your media library");
                return;
            }

            // Pick the video
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const videoUri = result.assets[0].uri;

                // Log the video details
                console.log('Video URI:', videoUri);

                const formData = new FormData();
                const fileType = videoUri.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';

                formData.append('video', {
                    uri: Platform.OS === 'ios' ? videoUri.replace('file://', '') : videoUri,
                    type: fileType,
                    name: 'upload.mp4'
                } as any);

                // Log the request details
                console.log('Sending request to webhook...');

                const response = await fetch('https://webhook.site/8eb723ee-258f-462c-a178-e37d72f4edd2', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log('Response status:', response.status);
                const responseText = await response.text();
                console.log('Response body:', responseText);

                if (response.ok) {
                    // const jsonResponse = await response.json();
                    // setPollTapeData(jsonResponse);

                    // Set pollTapeData to the imported JSON data
                    setPollTapeData(sampleData);
                    Alert.alert("Success", "Video uploaded successfully!");
                    setIsScanComplete(true);
                } else {
                    throw new Error('Upload failed');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            // Log more details about the response
            if (error instanceof Error) {
                Alert.alert(
                    "Upload Failed",
                    `Error: ${error.message}`
                );
            }
        }
    };

    const handleReviewTape = () => {
        if (!pollTapeData) {
            Alert.alert("Error", "No poll tape data available to review");
            return;
        }
        navigation.navigate("Review", {
            pollTapeData,
            onSave: (updatedData: any) => {
                setPollTapeData(updatedData);
                Alert.alert("Success", "Changes saved successfully!");
            }
        });
    };

    const handlePublishTape = () => {
        // Trigger publishing action here
        Alert.alert("Publish Poll Tape", "Poll Tape has been published.");
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.halfButton]}
                        onPress={handleScanTape}
                    >
                        <Text style={styles.buttonText}>Scan Poll Tape</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.halfButton]}
                        onPress={handleUploadTape}
                    >
                        <Text style={styles.buttonText}>Upload Poll Tape</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    // TODO: Remove Test Code
                    // style={[styles.button, !isScanComplete && styles.disabledButton]}
                    style={[styles.button]}
                    onPress={handleReviewTape}
                // disabled={!isScanComplete}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    buttonContainer: {
        width: '90%',  // This controls the width of all buttons
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    halfButton: {
        flex: 0.485,  // Slightly less than half to create gap between buttons
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 5,
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
