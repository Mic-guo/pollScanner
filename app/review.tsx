import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TextInput, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './_layout';
import { green } from 'react-native-reanimated/lib/typescript/Colors';

type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'Review'>;

type Props = {
    route: ReviewScreenRouteProp;
};

const Review: React.FC<Props> = ({ route }) => {
    const { pollTapeData } = route.params;
    const [editablePollTapeData, setEditablePollTapeData] = useState(pollTapeData);
    const typeInputRef = useRef<TextInput>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const navigation = useNavigation();

    const handleSave = useCallback(() => {
        if (route.params.onSave) {
            route.params.onSave(editablePollTapeData);
            setHasChanges(false);
        }
    }, [editablePollTapeData, route.params]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!hasChanges}
                    style={{ marginRight: 15 }}
                >
                    <Text style={{
                        color: hasChanges ? '#007AFF' : '#A9A9A9',
                        fontSize: 17,
                        fontWeight: '600'
                    }}>
                        Save
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, handleSave, hasChanges]);

    const handleInputSubmit = useCallback(
        (path: string, value: string) => {
            setEditablePollTapeData((prev: typeof editablePollTapeData) => {
                const updatedData = JSON.parse(JSON.stringify(prev));
                const keys = path.split('.');
                let target = updatedData;

                for (let i = 0; i < keys.length - 1; i++) {
                    target = target[keys[i]];
                }

                target[keys[keys.length - 1]] = value;
                setHasChanges(true);
                return updatedData;
            });
        },
        [setEditablePollTapeData]
    );

    const formatDayOfWeek = (date: string | null | undefined) => {
        if (!date) return '';
        try {
            const localDate = new Date(date + 'T00:00:00');
            const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
            return localDate.toLocaleDateString(undefined, options);
        } catch (error) {
            console.warn('Error formatting day of week:', error);
            return '';
        }
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return '';
        try {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            const parsedDate = new Date(date + 'T00:00:00');
            return parsedDate.toLocaleDateString(undefined, options);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return '';
        }
    };

    const formatDateOnly = (isoTimestamp: string | null | undefined) => {
        if (!isoTimestamp) return '';
        try {
            const dateParts = isoTimestamp.split('T')[0].split('-');
            if (dateParts.length !== 3) return '';

            const [year, month, day] = dateParts;
            const localDate = new Date(Number(year), Number(month) - 1, Number(day));

            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            };
            return localDate.toLocaleDateString(undefined, options);
        } catch (error) {
            console.warn('Error formatting date only:', error);
            return '';
        }
    };

    const formatTimeOnly = (isoTimestamp: string | null | undefined) => {
        if (!isoTimestamp) return '';
        try {
            const date = new Date(isoTimestamp);
            if (isNaN(date.getTime())) return ''; // Check if date is invalid

            const options: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            return date.toLocaleTimeString(undefined, options);
        } catch (error) {
            console.warn('Error formatting time only:', error);
            return '';
        }
    };

    const handleTimestampUpdate = useCallback(
        (path: string, type: 'date' | 'time', value: string) => {
            if (!value.trim()) return; // Don't process empty values

            setEditablePollTapeData((prev: typeof editablePollTapeData) => {
                try {
                    const updatedData = JSON.parse(JSON.stringify(prev));
                    const keys = path.split('.');
                    let target = updatedData;

                    // Navigate to the timestamp
                    for (let i = 0; i < keys.length - 1; i++) {
                        target = target[keys[i]];
                    }

                    const currentTimestamp = new Date(target[keys[keys.length - 1]] || new Date());

                    if (type === 'date') {
                        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                            console.warn('Invalid date format. Expected MM/DD/YYYY');
                            return prev;
                        }

                        const [month, day, year] = value.split('/');
                        const newDate = new Date(currentTimestamp);
                        newDate.setFullYear(Number(year), Number(month) - 1, Number(day));

                        // Validate the date is real (e.g., not 02/31/2024)
                        if (isNaN(newDate.getTime())) {
                            console.warn('Invalid date values');
                            return prev;
                        }

                        target[keys[keys.length - 1]] = newDate.toISOString();
                    } else {
                        if (!/^\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(value)) {
                            console.warn('Invalid time format. Expected HH:MM AM/PM');
                            return prev;
                        }

                        const [timeStr, period] = value.split(' ');
                        let [hours, minutes] = timeStr.split(':').map(Number);

                        // Validate hours and minutes
                        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
                            console.warn('Invalid time values');
                            return prev;
                        }

                        if (period.toUpperCase() === 'PM' && hours !== 12) {
                            hours += 12;
                        } else if (period.toUpperCase() === 'AM' && hours === 12) {
                            hours = 0;
                        }

                        const newDate = new Date(currentTimestamp);
                        newDate.setHours(hours, minutes);

                        target[keys[keys.length - 1]] = newDate.toISOString();
                    }

                    setHasChanges(true);
                    return updatedData;
                } catch (error) {
                    console.warn('Error updating timestamp:', error);
                    return prev;
                }
            });
        },
        [setEditablePollTapeData]
    );


    const ElectionHeaderSection: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
        <>
            {/* Election Header */}
            <View style={styles.pollTapeHeader}>
                <Text style={styles.pollTapeHeaderText}>Election Header</Text>
            </View>

            <View style={[styles.tighterGroup]}>
                <TextInput
                    ref={typeInputRef}
                    style={[styles.pollTapeText, styles.editableText]}
                    placeholder="Enter Election Type"
                    placeholderTextColor="red"
                    defaultValue={editablePollTapeData.election_header.type}
                    onEndEditing={(e) => handleInputSubmit('election_header.type', e.nativeEvent.text)}
                />
                <Text style={[styles.pollTapeText]}>
                    {formatDayOfWeek(editablePollTapeData.election_header.date)},
                </Text>
                <Text style={styles.pollTapeText}>{formatDate(editablePollTapeData.election_header.date)}</Text>
                <View style={[styles.row]}>
                    <Text style={styles.pollTapeText}>Election Date: </Text>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText, { marginBottom: 10, marginTop: -18 }]}
                        placeholder="Enter Election Date"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.election_header.date}
                        onEndEditing={(e) => handleInputSubmit('election_header.date', e.nativeEvent.text)}
                    />
                </View>
            </View>

            <View style={styles.groupSpacer} />

            <View style={[styles.tighterGroup]}>
                <View style={[styles.row]}>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText]}
                        placeholder="Enter County"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.election_header.location.county}
                        onEndEditing={(e) => handleInputSubmit('election_header.location.county', e.nativeEvent.text)}
                    />
                    <Text style={[styles.pollTapeText, { marginBottom: 0 }]}>, </Text>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText]}
                        placeholder="Enter State"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.election_header.location.state}
                        onEndEditing={(e) => handleInputSubmit('election_header.location.state', e.nativeEvent.text)}
                    />
                </View>

                <View style={[styles.row]}>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText]}
                        placeholder="Enter Township"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.election_header.location.precinct.township}
                        onEndEditing={(e) => handleInputSubmit('election_header.location.precinct.township', e.nativeEvent.text)}
                    />
                    <Text style={[styles.pollTapeText, { marginBottom: 0 }]}>, </Text>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText]}
                        placeholder="Enter Precinct Number"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.election_header.location.precinct.number}
                        onEndEditing={(e) => handleInputSubmit('election_header.location.precinct.number', e.nativeEvent.text)}
                    />
                </View>

                <View style={[styles.row]}>
                    <Text style={[styles.pollTapeText, { marginTop: 10 }]}>Election Day Voting</Text>
                </View>
            </View>

            <View style={styles.groupSpacer} />

            <View style={styles.tighterGroup}>
                <View style={[styles.row]}>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText]}
                        placeholder="Enter Voting System Type"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.voting_system.type}
                        onEndEditing={(e) => handleInputSubmit('voting_system.type', e.nativeEvent.text)}
                    />
                </View>

                <View style={[styles.row]}>
                    <Text style={styles.pollTapeText}>S/N: </Text>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText, { marginTop: 0 }, { marginBottom: 30 }]}
                        placeholder="Enter Serial Number"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.voting_system.serial_number}
                        onEndEditing={(e) => handleInputSubmit('voting_system.serial_number', e.nativeEvent.text)}
                    />
                </View>

                <View style={[styles.row]}>
                    <Text style={styles.pollTapeText}>Version: </Text>
                    <TextInput
                        style={[styles.pollTapeText, styles.editableText, { marginTop: -8 }]}
                        placeholder="Enter Version"
                        placeholderTextColor="red"
                        defaultValue={editablePollTapeData.voting_system.version}
                        onEndEditing={(e) => handleInputSubmit('voting_system.version', e.nativeEvent.text)}
                    />
                </View>
            </View>

            <View style={styles.groupSpacer} />

            <View style={styles.tighterGroup}>
                {isOpen ? (
                    <>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <Text style={styles.pollTapeText}>Ballot Counter: </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText, { marginTop: -7 }]}
                                placeholder="Enter Count"
                                placeholderTextColor="red"
                                defaultValue={editablePollTapeData.reports.open_polls.counters.ballot_counter}
                                onEndEditing={(e) => handleInputSubmit('reports.open_polls.counters.ballot_counter', e.nativeEvent.text)}
                            />
                        </View>

                        <View style={[styles.row]}>
                            <Text style={styles.pollTapeText}>Lifetime Counter: </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText, { marginTop: -7 }]}
                                placeholder="Enter Count"
                                placeholderTextColor="red"
                                defaultValue={editablePollTapeData.reports.open_polls.counters.lifetime_counter}
                                onEndEditing={(e) => handleInputSubmit('reports.open_polls.counters.lifetime_counter', e.nativeEvent.text)}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <Text style={styles.pollTapeText}>Ballot Counter: </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText, { marginTop: -7 }]}
                                placeholder="Enter Count"
                                placeholderTextColor="red"
                                defaultValue={editablePollTapeData.reports.closed_polls.counters.ballot_counter}
                                onEndEditing={(e) => handleInputSubmit('reports.closed_polls.counters.ballot_counter', e.nativeEvent.text)}
                            />
                        </View>

                        <View style={[styles.row]}>
                            <Text style={styles.pollTapeText}>Lifetime Counter: </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText, { marginTop: -7 }]}
                                placeholder="Enter Count"
                                placeholderTextColor="red"
                                defaultValue={editablePollTapeData.reports.closed_polls.counters.lifetime_counter}
                                onEndEditing={(e) => handleInputSubmit('reports.closed_polls.counters.lifetime_counter', e.nativeEvent.text)}
                            />
                        </View>
                    </>
                )}
            </View>

            <View style={styles.groupSpacer} />
        </>
    );

    type PollTapeResults = {
        results: {
            contests: Array<{
                title: string;
                candidates: Array<{
                    ticket: string[];
                    votes: string;
                }>;
                metadata: {
                    write_ins: string;
                    undervotes: string;
                    overvotes: string;
                    invalid_votes: string;
                };
            }>;
        };
    };

    const ContestDisplay: React.FC<{
        contest: {
            title: string;
            candidates: Array<{ ticket: string[]; votes: string }>;
            metadata: {
                write_ins: string;
                undervotes: string;
                overvotes: string;
                invalid_votes: string;
            };
        };
        contestIndex: number;
    }> = ({ contest, contestIndex }) => (
        <View style={styles.contestContainer}>
            <Text style={styles.contestTitle}>{contest.title}</Text>

            {contest.candidates.map((candidate, idx) => (
                <View key={idx} style={[styles.rowJustify, styles.candidateRow]}>
                    <View style={styles.ticketContainer}>
                        {candidate.ticket.map((name, nameIdx) => (
                            <Text key={nameIdx} style={[
                                styles.pollTapeText,
                                styles.ticketText,
                                nameIdx !== candidate.ticket.length - 1 && styles.multiTicketText
                            ]}>
                                {name}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.voteContainer}>
                        <TextInput
                            style={[styles.pollTapeText, styles.editableText, { marginTop: -15 }]}
                            placeholder="Enter votes"
                            placeholderTextColor="red"
                            defaultValue={candidate.votes}
                            onEndEditing={(e) => handleInputSubmit(
                                `results.contests.${contestIndex}.candidates.${idx}.votes`,
                                e.nativeEvent.text
                            )}
                        />
                    </View>
                </View>
            ))}

            {/* Metadata */}
            <View style={[styles.tighterGroup, styles.rowJustify]}>
                <Text style={styles.pollTapeText}>Write-ins:</Text>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText]}
                    placeholder="Enter write-ins"
                    placeholderTextColor="red"
                    defaultValue={contest.metadata.write_ins}
                    onEndEditing={(e) => handleInputSubmit(
                        `results.contests.${contestIndex}.metadata.write_ins`,
                        e.nativeEvent.text
                    )}
                />
            </View>

            <View style={[styles.tighterGroup, styles.rowJustify]}>
                <Text style={styles.pollTapeText}>Undervotes:</Text>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText]}
                    placeholder="Enter undervotes"
                    placeholderTextColor="red"
                    defaultValue={contest.metadata.undervotes}
                    onEndEditing={(e) => handleInputSubmit(
                        `results.contests.${contestIndex}.metadata.undervotes`,
                        e.nativeEvent.text
                    )}
                />
            </View>

            <View style={[styles.tighterGroup, styles.rowJustify]}>
                <Text style={styles.pollTapeText}>Overvotes:</Text>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText]}
                    placeholder="Enter overvotes"
                    placeholderTextColor="red"
                    defaultValue={contest.metadata.overvotes}
                    onEndEditing={(e) => handleInputSubmit(
                        `results.contests.${contestIndex}.metadata.overvotes`,
                        e.nativeEvent.text
                    )}
                />
            </View>

            <View style={[styles.tighterGroup, styles.rowJustify]}>
                <Text style={styles.pollTapeText}>Invalid votes:</Text>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText]}
                    placeholder="Enter invalid votes"
                    placeholderTextColor="red"
                    defaultValue={contest.metadata.invalid_votes}
                    onEndEditing={(e) => handleInputSubmit(
                        `results.contests.${contestIndex}.metadata.invalid_votes`,
                        e.nativeEvent.text
                    )}
                />
            </View>

            <View style={styles.contestSpacer} />
        </View>
    );

    const PrecinctBallotCount: React.FC<{
        totals: {
            precinct_ballot_count: {
                precinct: {
                    name: string;
                    total: string;
                };
                grand_total: string;
            };
        };
    }> = ({ totals }) => (
        <View style={styles.ballotCountContainer}>

            <Text style={[styles.pollTapeText, { textAlign: 'center' }]}>Precinct Ballot Count</Text>

            {/* Column Headers */}
            <View style={[styles.rowJustify, styles.headerRow]}>
                <Text style={styles.pollTapeText}>Pct</Text>
                <Text style={styles.pollTapeText}>Total</Text>
            </View>

            {/* Separator Line */}
            <View style={styles.separatorLine} />

            {/* Precinct Row */}
            <View style={[styles.rowJustify, styles.dataRow]}>
                <View style={styles.precinctContainer}>
                    <Text style={styles.pollTapeText}>{totals.precinct_ballot_count.precinct.name}</Text>
                </View>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText, styles.totalInput]}
                    placeholder="Enter total"
                    placeholderTextColor="red"
                    defaultValue={totals.precinct_ballot_count.precinct.total}
                    onEndEditing={(e) => handleInputSubmit('totals.precinct_ballot_count.precinct.total', e.nativeEvent.text)}
                />
            </View>

            {/* Separator Line */}
            <View style={styles.doubleSeparatorLine} />

            {/* Grand Total Row */}
            <View style={[styles.rowJustify, styles.dataRow]}>
                <Text style={styles.pollTapeText}>Total</Text>
                <TextInput
                    style={[styles.pollTapeText, styles.editableText, styles.totalInput]}
                    placeholder="Enter grand total"
                    placeholderTextColor="red"
                    defaultValue={totals.precinct_ballot_count.grand_total}
                    onEndEditing={(e) => handleInputSubmit('totals.precinct_ballot_count.grand_total', e.nativeEvent.text)}
                />
            </View>

            <View style={styles.contestSpacer} />
        </View>
    );


    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
                {/* Poll Tape Section */}
                <View style={styles.pollTapeContainer}>
                    {/* Open Polls Header Section */}
                    <ElectionHeaderSection isOpen={true} />

                    {/* Open Polls Report Header */}
                    <View style={styles.pollTapeHeader}>
                        <Text style={styles.pollTapeHeaderText}>Open Polls Report</Text>
                    </View>

                    {/* Open Polls Timestamp */}
                    <View style={styles.tighterGroup}>
                        <Text style={styles.pollTapeText}>Date & Time Printed:</Text>
                        <View style={[styles.row]}>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText]}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="red"
                                defaultValue={formatDateOnly(editablePollTapeData.reports.open_polls.timestamp)}
                                onEndEditing={(e) => handleTimestampUpdate('reports.open_polls.timestamp', 'date', e.nativeEvent.text)}
                            />
                            <Text style={styles.pollTapeText}> </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText]}
                                placeholder="HH:MM AM/PM"
                                placeholderTextColor="red"
                                defaultValue={formatTimeOnly(editablePollTapeData.reports.open_polls.timestamp)}
                                onEndEditing={(e) => handleTimestampUpdate('reports.open_polls.timestamp', 'time', e.nativeEvent.text)}
                            />
                        </View>
                    </View>

                    <View style={styles.groupSpacer} />

                    <View style={styles.tighterGroup}>
                        <Text style={styles.pollTapeText}>Polls are open.</Text>
                        <Text style={styles.pollTapeText}>Ready to accept ballots</Text>
                    </View>

                    <View style={styles.sectionSpacer} />

                    {/* Close Polls Header Section */}
                    <ElectionHeaderSection isOpen={false} />

                    {/* Close Polls Report Header */}
                    <View style={styles.pollTapeHeader}>
                        <Text style={styles.pollTapeHeaderText}>Close Polls Report</Text>
                    </View>

                    {/* Closed Polls Timestamp */}
                    <View style={styles.tighterGroup}>
                        <Text style={styles.pollTapeText}>Date & Time Printed:</Text>
                        <View style={[styles.row]}>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText]}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="red"
                                defaultValue={formatDateOnly(editablePollTapeData.reports.closed_polls.timestamp)}
                                onEndEditing={(e) => handleTimestampUpdate('reports.closed_polls.timestamp', 'date', e.nativeEvent.text)}
                            />
                            <Text style={styles.pollTapeText}> </Text>
                            <TextInput
                                style={[styles.pollTapeText, styles.editableText]}
                                placeholder="HH:MM AM/PM"
                                placeholderTextColor="red"
                                defaultValue={formatTimeOnly(editablePollTapeData.reports.closed_polls.timestamp)}
                                onEndEditing={(e) => handleTimestampUpdate('reports.closed_polls.timestamp', 'time', e.nativeEvent.text)}
                            />
                        </View>
                    </View>

                    <View style={styles.groupSpacer} />

                    <View style={styles.tighterGroup}>
                        <Text style={styles.pollTapeAnnouncement}>Polls are Closed</Text>
                    </View>

                    <View style={styles.pollTapeHeader}>
                        <Text style={styles.pollTapeHeaderText}>Tally Report by Precinct</Text>
                    </View>

                    <View style={[styles.tighterGroup, styles.rowJustify]}>
                        <Text style={styles.pollTapeText}>Precincts included:</Text>
                        <TextInput
                            style={[styles.pollTapeText, styles.editableText, { marginTop: -7 }]}
                            placeholder="Enter precincts"
                            placeholderTextColor="#666"
                            defaultValue={editablePollTapeData.tally_report.precincts_included}
                            onEndEditing={(e) => handleInputSubmit('tally_report.precincts_included', e.nativeEvent.text)}
                        />
                    </View>

                    <View style={styles.sectionSpacer} />

                    <View style={styles.pollTapeHeader}>
                        <Text style={styles.pollTapeHeaderText}>{editablePollTapeData.election_header.location.precinct.township},</Text>
                        <Text style={styles.pollTapeHeaderText}>Precinct {editablePollTapeData.election_header.location.precinct.number}</Text>
                    </View>

                    {(editablePollTapeData as PollTapeResults).results.contests.map((contest, index) => (
                        <ContestDisplay
                            key={index}
                            contest={contest}
                            contestIndex={index}
                        />
                    ))}

                    <View style={styles.sectionSpacer} />

                    <PrecinctBallotCount totals={editablePollTapeData.totals} />

                </View>
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
    dataContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    pollTapeContainer: {
        backgroundColor: '#fff', // White background for the tape
        borderRadius: 10, // Rounded corners
        padding: 20, // Padding inside the container
        shadowColor: '#000', // Subtle shadow
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1, // Add a thin border
        borderColor: '#ddd', // Light gray border
        width: '95%', // Fit within the screen
        alignSelf: 'center', // Center the container horizontally
        marginBottom: 20, // Add space below the container
    },
    pollTapeHeader: {
        backgroundColor: '#000', // Black background for the header
        paddingVertical: 10, // Vertical padding for the header
        borderTopLeftRadius: 10, // Rounded corners at the top
        borderTopRightRadius: 10,
    },
    pollTapeHeaderText: {
        color: '#fff', // White text color
        fontSize: 18, // Match the text size of the poll tape
        lineHeight: 28,
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Simulate typewriter font
    },
    rowJustify: {
        flexDirection: 'row', // Align children horizontally
        justifyContent: 'space-between', // Push items to the left and right edges
        alignItems: 'center', // Vertically align text
        width: '100%', // Ensure the row spans the container's width
    },
    pollTapeText: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'left',
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Simulate typewriter font
    },
    pollTapeAnnouncement: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Simulate typewriter font
    },
    pollTapeResult: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'right',
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Simulate typewriter font
    },
    tighterGroup: {
        marginVertical: 5, // Slight margin between items in a group
    },
    groupSpacer: {
        height: 15, // Larger space between groups
    },
    sectionSpacer: {
        height: 125, // Larger space between groups
    },
    editableText: {
        borderBottomWidth: 0,
        borderBottomColor: '#ccc',
        marginBottom: 20,
        color: 'blue'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contestContainer: {
        marginVertical: 10,
        width: '100%',
    },
    contestTitle: {
        fontSize: 18,
        textDecorationLine: 'underline',
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    candidateRow: {
        minHeight: 50,  // Ensure minimum height for single line items
    },
    ticketContainer: {
        flex: 1,
        marginRight: 10,
        justifyContent: 'center',
    },
    voteContainer: {
        justifyContent: 'center',  // Center vote input vertically
        alignItems: 'flex-end',    // Align to the right
    },
    contestSpacer: {
        height: 20,
    },
    ticketText: {
        marginBottom: 20,
    },
    multiTicketText: {
        marginBottom: 2, // Reduced spacing for multiple tickets
    },
    ballotCountContainer: {
        width: '100%',
    },
    headerRow: {
        marginVertical: 10,
    },
    dataRow: {
        marginVertical: 5,
    },
    precinctContainer: {
        flex: 1,
        marginRight: 10,
    },
    separatorLine: {
        height: 1,
        backgroundColor: '#000',
        width: '100%',
        marginVertical: 5,
    },
    doubleSeparatorLine: {
        height: 3,  // Made thicker to match the image
        backgroundColor: '#000',
        width: '100%',
        marginVertical: 5,
    },
    totalInput: {
        minWidth: 50,
        textAlign: 'right',
        marginBottom: 0,  // Override default margin
    },
});

export default Review;
