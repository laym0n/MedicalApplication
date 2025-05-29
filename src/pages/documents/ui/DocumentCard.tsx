import React, {useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Document} from '@shared/db/entity/document';
import {useNavigation} from '@react-navigation/native';
import { formatDate } from '@shared/util/data-form';

interface Props {
  document: Document;
  onDelete?: (id: string) => void;
}

const getIconByMime = (mime: string): string => {
  if (mime.includes('pdf')) return 'file-pdf-box';
  if (mime.includes('image')) return 'file-image';
  if (mime.includes('word')) return 'file-word-box';
  if (mime.includes('excel')) return 'file-excel-box';
  return 'file-document-outline';
};

const DocumentCard: React.FC<Props> = ({document, onDelete}) => {
  const navigation = useNavigation();
  const onPress = useCallback(
    () => navigation.navigate('DocumentView', {documentId: document.id}),
    [document.id, navigation],
  );
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Icon name={getIconByMime(document.mime)} size={36} color="#007AFF" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(document.createdAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete?.(document.id)}>
        <Icon name="trash-can-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default DocumentCard;
