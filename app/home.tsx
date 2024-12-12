import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "./_layout";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
// import sampleData from "../Grand_Blanc_Township.json"; // Import the JSON data

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, "Home">;

const API_BASE_URL = "http://35.2.175.255:8000";

const Home: React.FC = () => {
    const [isScanComplete, setIsScanComplete] = useState(false);
    const [isReviewComplete, setIsReviewComplete] = useState(false);
    const [pollTapeData, setPollTapeData] = useState<any>(null);
    const [reviewFileName, setReviewFileName] = useState<string | null>(null);
    const navigation = useNavigation<HomeScreenNavigationProp>();

    // Load `sampleData` on component mount
    // TODO: Remove Test Code
    //   useEffect(() => {
    //     setPollTapeData(sampleData);
    //     console.log("Poll tape data initialized with sample data:", sampleData);
    //   }, []);

    const handleScanTape = () => {
        // Trigger navigation to the scan page or scan functionality here
        // Simulate a successful video upload
        // Alert.alert("Scan Poll Tape", "Video uploaded successfully.");
        navigation.navigate("Camera");
        // setIsScanComplete(true);
    };

    const showRecordingGuidelines = () => {
        navigation.navigate('Guidelines');
    };

    const handleUploadTape = async () => {
        try {
            // Request permissions
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Please allow access to your media library"
                );
                return;
            }

            // Pick the video
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["videos"],
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const videoUri = result.assets[0].uri;
                const formData = new FormData();
                const fileType = videoUri.endsWith(".mov")
                    ? "video/quicktime"
                    : "video/mp4";

                const fileData = {
                    uri:
                        Platform.OS === "ios" ? videoUri.replace("file://", "") : videoUri,
                    type: fileType,
                    name: "upload.mp4",
                };
                formData.append("video", fileData as any);

                const response = await fetch(`${API_BASE_URL}/upload-video`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                });

                console.log("Response status:", response.status);
                console.log("Response headers:", response.headers);
                const responseData = await response.json();
                console.log("Response body:", responseData);

                if (response.ok) {
                    setPollTapeData(responseData.ocr_results);
                    setReviewFileName(responseData.file_name);
                    console.log("Poll tape data:", responseData.ocr_results);
                    console.log("Review file name:", responseData.file_name);
                    Alert.alert("Success", "Video uploaded and processed successfully!");
                    setIsScanComplete(true);
                } else {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            if (error instanceof Error) {
                Alert.alert("Upload Failed", `Error: ${error.message}`);
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
            onSave: async (updatedData: any) => {
                setPollTapeData(updatedData);
                if (!reviewFileName) {
                    Alert.alert("Error", "No review file path available");
                    return;
                }

                try {
                    // Extract directory name from reviewFilePath
                    const response = await fetch(
                        `${API_BASE_URL}/save-processed-result/${reviewFileName}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(updatedData),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Server responded with status: ${response.status}`);
                    }

                    Alert.alert("Success", "Changes saved successfully!");
                } catch (error) {
                    console.error("Save error:", error);
                    Alert.alert(
                        "Save Failed",
                        error instanceof Error ? error.message : "Failed to save changes"
                    );
                }
            },
        });
    };

    const handleUnpublishedTapes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/processed-results`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Create array of tape names and their data
            const tapes = Object.entries(data).map(([name, tapeData]) => ({
                name,
                data: tapeData,
            }));

            // If no tapes available
            if (tapes.length === 0) {
                Alert.alert(
                    "No Tapes Available",
                    "There are no processed poll tapes to review."
                );
                return;
            }

            // Show list of available tapes
            Alert.alert(
                "Select Poll Tape to Review",
                "Choose a processed poll tape to review:",
                [
                    // Add dismiss button as first option
                    {
                        text: "Dismiss",
                        style: "cancel",
                    },
                    // Spread the existing tape buttons
                    ...tapes.map((tape) => ({
                        text: tape.name,
                        onPress: () => {
                            navigation.navigate("Review", {
                                pollTapeData: tape.data,
                                onSave: async (updatedData: any) => {
                                    if (!tape.name) {
                                        Alert.alert("Error", "No review file path available");
                                        return;
                                    }

                                    try {
                                        // Extract directory name from reviewFilePath
                                        const response = await fetch(
                                            `${API_BASE_URL}/save-processed-result/${tape.name}`,
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify(updatedData),
                                            }
                                        );

                                        if (!response.ok) {
                                            throw new Error(
                                                `Server responded with status: ${response.status}`
                                            );
                                        }

                                        Alert.alert("Success", "Changes saved successfully!");
                                    } catch (error) {
                                        console.error("Save error:", error);
                                        Alert.alert(
                                            "Save Failed",
                                            error instanceof Error
                                                ? error.message
                                                : "Failed to save changes"
                                        );
                                    }
                                },
                            });
                        },
                    })),
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error("Error fetching processed results:", error);
            Alert.alert(
                "Error",
                "Failed to fetch processed poll tapes. Please try again later."
            );
        }
    };

    const handlePublishTape = async () => {
        // TODO: Implement publishing action
        // Trigger publishing action here
        try {
            const response = await fetch(`${API_BASE_URL}/processed-results`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Create array of tape names and their data
            const tapes = Object.entries(data).map(([name, tapeData]) => ({
                name,
                data: tapeData,
            }));

            // If no tapes available
            if (tapes.length === 0) {
                Alert.alert(
                    "No Tapes Available",
                    "There are no processed poll tapes to publish."
                );
                return;
            }

            // Show list of available tapes
            Alert.alert(
                "Select Poll Tape to Publish",
                "Choose a processed poll tape to publish:",
                [
                    // Add dismiss button as first option
                    {
                        text: "Dismiss",
                        style: "cancel",
                    },
                    // Spread the existing tape buttons
                    ...tapes.map((tape) => ({
                        text: tape.name,
                        onPress: () => {
                            // Prompt for county name
                            Alert.prompt(
                                "Enter County Name",
                                "Please enter the county name:",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Next",
                                        onPress: (county?: string) => {
                                            if (!county) {
                                                Alert.alert("Error", "County name is required");
                                                return;
                                            }
                                            // Prompt for township name
                                            Alert.prompt(
                                                "Enter Township Name",
                                                "Please enter the township name:",
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Publish",
                                                        onPress: async (township?: string) => {
                                                            if (!township) {
                                                                Alert.alert(
                                                                    "Error",
                                                                    "Township name is required"
                                                                );
                                                                return;
                                                            }
                                                            try {
                                                                const response = await fetch(
                                                                    `${API_BASE_URL}/move-to-polltickets/${tape.name
                                                                    }/${encodeURIComponent(
                                                                        county
                                                                    )}/${encodeURIComponent(township)}`,
                                                                    { method: "POST" }
                                                                );

                                                                if (!response.ok) {
                                                                    throw new Error(
                                                                        `Server responded with status: ${response.status}`
                                                                    );
                                                                }

                                                                Alert.alert(
                                                                    "Success",
                                                                    "Poll tape published successfully!"
                                                                );
                                                            } catch (error) {
                                                                console.error("Publish error:", error);
                                                                Alert.alert(
                                                                    "Publish Failed",
                                                                    error instanceof Error
                                                                        ? error.message
                                                                        : "Failed to publish poll tape"
                                                                );
                                                            }
                                                        },
                                                    },
                                                ]
                                            );
                                        },
                                    },
                                ]
                            );
                        },
                    })),
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error("Error fetching processed results:", error);
            Alert.alert(
                "Error",
                "Failed to fetch processed poll tapes. Please try again later."
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.guidelinesButton]}
                    onPress={showRecordingGuidelines}
                >
                    <Text style={styles.buttonText}>Recording Guidelines</Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.halfButton]}
                        onPress={handleUploadTape}
                    >
                        <Text style={styles.buttonText}>Upload Poll Tape</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.halfButton,
                            !isScanComplete && styles.disabledButton,
                        ]}
                        onPress={handleReviewTape}
                        disabled={!isScanComplete}
                    >
                        <Text style={styles.buttonText}>Review Poll Tape</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.unpublishedButton]}
                    onPress={handleUnpublishedTapes}
                >
                    <Text style={styles.buttonText}>Unpublished Poll Tapes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.publishButton,
                        // (!isScanComplete || !isReviewComplete) && styles.disabledButton,
                    ]}
                    onPress={handlePublishTape}
                //   disabled={!isScanComplete || !isReviewComplete}
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
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    buttonContainer: {
        width: "90%", // This controls the width of all buttons
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    halfButton: {
        flex: 0.485, // Slightly less than half to create gap between buttons
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 5,
    },
    disabledButton: {
        backgroundColor: "#94A3B8",
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    primaryButton: {
        backgroundColor: "#2563EB",
    },
    secondaryButton: {
        backgroundColor: "#3B82F6",
    },
    unpublishedButton: {
        backgroundColor: "#FFA07A",
    },
    publishButton: {
        backgroundColor: "#008080",
    },
    guidelinesButton: {
        backgroundColor: "#4B5563",
        marginBottom: 20,
    },
});

export default Home;
