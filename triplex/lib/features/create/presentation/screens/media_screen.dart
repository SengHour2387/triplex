import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:triplex/features/create/domain/notifiers/create_media_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/presentation/widgets/media_card_widget.dart';

class MediaScreen extends ConsumerStatefulWidget {
  final TextEditingController? captionController;

  const MediaScreen({
    super.key,
    this.captionController,
  });

  @override
  ConsumerState<MediaScreen> createState() => _MediaScreenState();
}

class _MediaScreenState extends ConsumerState<MediaScreen> {
  Future<void> _addImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (image != null) {
      ref.read(createMediaProvider.notifier).addImage(image);
    }
  }

  Future<void> _addMultipleImages() async {
    final images = await ImagePicker().pickMultiImage();
    if (images.isNotEmpty) {
      for (final img in images) {
        ref.read(createMediaProvider.notifier).addImage(img);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final mediaState = ref.watch(createMediaProvider);
    final tripPlan = ref.watch(createTripPlanProvider);
    final hasPlanConfigured = tripPlan.title.trim().isNotEmpty ||
        (tripPlan.end != null && tripPlan.end!.title.isNotEmpty);

    return ColoredBox(
      color: colorScheme.surfaceContainerLowest,
      child: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Row(
              children: [
                Text(
                  "Media Attachments",
                ),
              ],
            ),
          ),

          // Horizontal list of selected media cards
          if (mediaState.mediaFiles.isNotEmpty)
            SizedBox(
              height: 200,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: mediaState.mediaFiles.length,
                itemBuilder: (context, index) {
                  final file = mediaState.mediaFiles[index];
                  return MediaCardWidget(
                    key: ValueKey(file.path),
                    path: file.path,
                    onPressRemove: () {
                      ref
                          .read(createMediaProvider.notifier)
                          .removeImageAt(index);
                    },
                  );
                },
              ),
            )
          else
            Container(
              height: 140,
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: colorScheme.surfaceBright,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_a_photo_rounded,
                        size: 40, color: colorScheme.onSurfaceVariant),
                    const SizedBox(height: 8),
                    Text(
                      "No photos or videos selected",
                      style: TextStyle(
                          color: colorScheme.onSurfaceVariant, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Buttons to add single or multiple photos
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(width: 20),
              Expanded(
                child: CupertinoButton.filled(
                  onPressed: _addImage,
                  child: const Text("Add Photo"),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CupertinoButton.filled(
                  onPressed: _addMultipleImages,
                  child: const Text("Add Multiple"),
                ),
              ),
              const SizedBox(width: 20),
            ],
          ),

          const SizedBox(height: 20),

          // Caption card
          Card(
            elevation: 0,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            color: colorScheme.surface,
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: CupertinoTextField(
                
                placeholder: "Write a caption for your post...", decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),
                controller: widget.captionController,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Trip Plan Attachment toggle card
          if (hasPlanConfigured) ...[
            Card(
              margin: const EdgeInsets.all(20),
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24)),
              color: colorScheme.surfaceBright,
              child: SwitchListTile.adaptive(
                title: const Text(
                  "Attach Trip Plan",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                subtitle: Text(
                  tripPlan.title.isNotEmpty
                      ? tripPlan.title
                      : "Current trip plan",
                  style: TextStyle(
                      fontSize: 12, color: colorScheme.onSurfaceVariant),
                ),
                value: mediaState.includeTripPlan,
                onChanged: (val) {
                  ref
                      .read(createMediaProvider.notifier)
                      .toggleIncludeTripPlan(val);
                },
                secondary:
                    Icon(Icons.route_rounded, color: colorScheme.primary),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
