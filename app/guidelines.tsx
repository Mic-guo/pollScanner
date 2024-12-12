import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Guidelines: React.FC = () => {
    const navigation = useNavigation();

    const guidelines = [
        {
            title: "Hold Steady",
            description: "Keep your device as stable as possible. Use both hands or rest your elbows on a stable surface to minimize camera shake."
        },
        {
            title: "Proper Lighting",
            description: "Ensure the area is well-lit with minimal shadows or glare. Avoid direct light sources that might cause reflections on the poll tape."
        },
        {
            title: "Flatten the Tape",
            description: "Make sure the poll tape is completely flat and smooth. Remove any creases or folds that might affect readability."
        },
        {
            title: "Proper Framing",
            description: "Center the poll tape in the frame. Ensure all edges are visible and the text fills most of the screen width."
        },
        {
            title: "Portrait Orientation",
            description: "Always record in portrait mode (vertical)."
        },
        {
            title: "Consistent Distance",
            description: "Maintain a steady distance from the poll tape throughout the recording. Avoid moving closer or farther while recording."
        },
        {
            title: "Full Coverage",
            description: "Ensure the entire poll tape is captured in the recording. Start slightly above the top and end just below the bottom."
        },
        {
            title: "Steady Pace",
            description: "Move down the poll tape at a slow, consistent speed. This helps ensure all text is clearly captured and readable."
        },
        {
            title: "Text Clarity",
            description: "Check that all numbers and text are in focus and clearly legible before starting the recording."
        },
        {
            title: "Clean Environment",
            description: "Record in a quiet area with minimal background noise. Ensure the surface and poll tape are clean and free of debris."
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Recording Guidelines</Text>
                <Text style={styles.subHeaderText}>Follow these guidelines for optimal results</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {guidelines.map((guideline, index) => (
                    <View key={index} style={styles.guidelineCard}>
                        <Text style={styles.guidelineTitle}>
                            {index + 1}. {guideline.title}
                        </Text>
                        <Text style={styles.guidelineDescription}>
                            {guideline.description}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#007AFF',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    scrollView: {
        flex: 1,
        padding: 15,
    },
    guidelineCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    guidelineTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    guidelineDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    backButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        margin: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Guidelines;