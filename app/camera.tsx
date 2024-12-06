import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform, Modal, Linking, Image, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

// Define the camera record response type
type VideoRecordResponse = {
  uri: string;
};

// Define type for the camera view ref
type CameraViewType = {
  recordAsync: (options?: {
    quality?: string;
    maxDuration?: number;
  }) => Promise<VideoRecordResponse>;
  stopRecording: () => void;
};

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    (async () => {
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaLibraryPermission.granted) {
        alert("Media library permission is required to save videos.");
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      console.log("Starting recording...");
      const videoRecordPromise = cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60,
      });
      setIsRecording(true);
      
      const data = await videoRecordPromise;
      console.log("Recording finished", data.uri);
      setRecordedVideoUri(data.uri);
      setIsPreviewVisible(true);
    } catch (error) {
      console.error("Error recording video:", error);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log("Stopping recording...");
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleRecordPress = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const uploadVideo = async (uri: string) => {
    try {
      setIsUploading(true);
      
      // First save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log('Video saved to library:', asset);

      // Here you would typically upload to your server
      // For now, we'll just simulate an upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Video uploaded successfully');
      return asset.uri;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmVideo = async () => {
    if (recordedVideoUri) {
      try {
        setIsUploading(true);
        await uploadVideo(recordedVideoUri);
        console.log('Video processed successfully');
        setIsPreviewVisible(false);
        setRecordedVideoUri(null);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload video");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancelVideo = () => {
    setRecordedVideoUri(null);
    setIsPreviewVisible(false);
  };

  const openMediaLibrary = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
        return;
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        first: 20,
        sortBy: ['creationTime']
      });
      console.log('Fetched assets:', assets.length);
      setMediaItems(assets);
      setIsMediaPreviewVisible(true);
    } catch (error) {
      console.error('Error opening media library:', error);
      alert('Failed to open media library: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Text style={styles.flipText}>⟲</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton
            ]} 
            onPress={handleRecordPress}
          >
            <View style={[
              styles.recordButtonInner,
              isRecording && styles.recordingButtonInner
            ]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.galleryButton} 
            onPress={openMediaLibrary}
          >
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      <Modal
        visible={isMediaPreviewVisible}
        animationType="slide"
        onRequestClose={() => setIsMediaPreviewVisible(false)}
      >
        <View style={styles.mediaPreviewContainer}>
          <TouchableOpacity 
            onPress={() => setIsMediaPreviewVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          
          <ScrollView>
            <Text style={{ color: 'white' }}>Media Items: {mediaItems.length}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    position: 'absolute',
    left: 30,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordingButton: {
    borderColor: '#ff0000',
  },
  recordButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#ff0000',
  },
  previewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideo: {
    width: '90%',
    aspectRatio: 16/9,
  },
  previewButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  galleryButton: {
    position: 'absolute',
    right: 30,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  mediaHeader: {
    height: 60,
    padding: 15,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  mediaItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  mediaItemImage: {
    width: '100%',
    height: '100%',
  },
});