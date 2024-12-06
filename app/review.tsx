import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './_layout';

type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'Review'>;

type Props = {
    route: ReviewScreenRouteProp;
};

const Review: React.FC<Props> = ({ route }) => {
    const { pollTapeData } = route.params;

    // Helper function to format the date in spelled-out format
    const formatDate = (date: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        // Parse the date and adjust to local time
        const parsedDate = new Date(date + 'T00:00:00'); // Explicitly set time to 00:00:00 in local timezone
        return parsedDate.toLocaleDateString(undefined, options);
    };    

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Election Header</Text>

                {/* Display type */}
                <Text style={styles.text}>{pollTapeData.election_header.type}</Text>

                {/* Display date in spelled-out format */}
                <Text style={styles.text}>{formatDate(pollTapeData.election_header.date)}</Text>
                <Text style={styles.text}>Election Date: {pollTapeData.election_header.date}</Text>

                {/* Display county and state */}
                <Text style={styles.text}>
                    {pollTapeData.election_header.location.county}, {pollTapeData.election_header.location.state}
                </Text>

                {/* Display precinct information */}
                <Text style={styles.text}>
                    {pollTapeData.election_header.location.precinct.township}, {pollTapeData.election_header.location.precinct.number}
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default Review;
