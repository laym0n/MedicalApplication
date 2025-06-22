import React from 'react';
import {View, StyleSheet, Modal, ActivityIndicator, Text} from 'react-native';

const LoaderOverlay = ({
  visible,
  status,
}: {
  visible: boolean;
  status: string;
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default LoaderOverlay;
