import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ParticipantView,
  useCallStateHooks,
  type StreamVideoParticipant,
} from '@stream-io/video-react-native-sdk';

export function EqualParticipantsGrid() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const orderedParticipants = useMemo(
    () =>
      [...participants].sort((a, b) => {
        if (a.isLocalParticipant === b.isLocalParticipant) {
          return 0;
        }
        return a.isLocalParticipant ? 1 : -1;
      }),
    [participants],
  );

  const rows = createRows(orderedParticipants);

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((participant) => (
            <View key={participant.sessionId} style={styles.cell}>
              <ParticipantView
                participant={participant}
                isVisible
                objectFit="cover"
                style={styles.participant}
                trackType="videoTrack"
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function createRows(participants: StreamVideoParticipant[]) {
  if (participants.length <= 2) {
    return participants.map((participant) => [participant]);
  }

  const rows: StreamVideoParticipant[][] = [];
  for (let index = 0; index < participants.length; index += 2) {
    rows.push(participants.slice(index, index + 2));
  }

  return rows;
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    backgroundColor: '#07111f',
    gap: 2,
    padding: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  participant: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: '#111827',
  },
});
