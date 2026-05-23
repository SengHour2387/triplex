import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

class PostImageOptimizer {
  /// Optimizes a user-uploaded image for a social feed.
  /// Resizes massive photos and converts them to transparent-friendly WebP.
  static Future<File?> optimizeForPost(File originalFile) async {
    // 1. Get a temporary directory to store the processing file
    final directory = await getTemporaryDirectory();

    // 2. Create a unique file name for the output WebP
    final String timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final String targetPath = '${directory.path}/post_img_$timestamp.webp';

    // 3. Compress AND Resize
    final XFile? result = await FlutterImageCompress.compressAndGetFile(
      originalFile.absolute.path,
      targetPath,
      format: CompressFormat.webp,
      quality: 75, // 70-80 is the sweet spot for social feeds
      minWidth: 1080, // Scales down 4K images to a standard HD width
      minHeight: 1080, // Maintains aspect ratio, won't distort
    );
    if (result == null) return null;
    return File(result.path);
  }
}