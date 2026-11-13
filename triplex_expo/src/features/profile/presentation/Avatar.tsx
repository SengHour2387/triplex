import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import type { User } from '../../../core/api/schemas';
import { Icon, Text, useTheme } from '../../../design-system';

export interface AvatarProps {
  user: Pick<User, 'avatar_url'>;
  size?: number;
  /** 0–100 while a new picture is uploading: dims the avatar and shows the percentage. */
  uploadProgress?: number | null;
}

/**
 * Profile picture, or — as in Flutter — a person glyph on a faint tint of the primary colour when
 * there is none (or it fails to load).
 */
export function Avatar({ user, size = 92, uploadProgress = null }: AvatarProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const url = user.avatar_url?.trim();
  const box = { width: size, height: size, borderRadius: size / 2 };

  const picture = url && !failed ? (
      <Image
        source={{ uri: url }}
        style={[box, { backgroundColor: `${colors.primary}00` }]}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    ) : (
    <View style={[styles.placeholder, box, { backgroundColor: `${colors.primary}00`}]}>
      <Icon name="person" size={size * 0.52} color={colors.primary} />
    </View>
  );

  if (uploadProgress === null) return picture;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Uploading profile picture" accessibilityValue={{ min: 0, max: 100, now: uploadProgress }}>
      {picture}
      <View style={[StyleSheet.absoluteFill, styles.overlay, box]}>
        <ActivityIndicator color="#FFFFFF" />
        {uploadProgress > 0 ? (
          <Text variant="footnote" weight="600" style={styles.percent}>
            {uploadProgress}%
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  overlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', gap: 2 },
  percent: { color: '#FFFFFF' },
});
