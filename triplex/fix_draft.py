import sys

with open('lib/features/profile/presentation/widgets/draft_trip_plan_card.dart', 'r') as f:
    text = f.read()

text = text.replace('''        AdaptiveSnackBar.show(
          context,
          message: "Draft posted successfully to feed",
        );''', '''        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Draft posted successfully to feed")),
        );''')

text = text.replace('''        AdaptiveSnackBar.show(
          context,
          message: e.toString().replaceAll("Exception: ", ""),
          type: AdaptiveSnackBarType.error,
        );''', '''        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll("Exception: ", "")), backgroundColor: Colors.red),
        );''')

text = text.replace('''    await AdaptiveAlertDialog.show(
      context: context,
      title: "Delete Draft",
      message: 'Are you sure you want to delete "$tripTitle"?',
      actions: [
        AlertAction(
          title: "Delete",
          style: AlertActionStyle.destructive,
          onPressed: () async {
            setState(() {
              _isDeleting = true;
            });

            try {
              await ref
                  .read(draftTripPlansProvider.notifier)
                  .removeDraft(widget.tripPlan);
              if (mounted) {
                AdaptiveSnackBar.show(
                  context,
                  message: "Draft deleted",
                );
              }
            } catch (e) {
              if (mounted) {
                AdaptiveSnackBar.show(
                  context,
                  message:
                      "Failed to delete draft: ${e.toString().replaceAll("Exception: ", "")}",
                  type: AdaptiveSnackBarType.error,
                );
              }
            } finally {
              if (mounted) {
                setState(() {
                  _isDeleting = false;
                });
              }
            }
          },
        ),
        AlertAction(
          title: "Cancel",
          style: AlertActionStyle.cancel,
          onPressed: () {},
        ),
      ],
    );''', '''    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Delete Draft"),
        content: Text('Are you sure you want to delete "$tripTitle"?'),
        actions: [
          TextButton(
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
            onPressed: () async {
              Navigator.of(context).pop();
              setState(() {
                _isDeleting = true;
              });

              try {
                await ref
                    .read(draftTripPlansProvider.notifier)
                    .removeDraft(widget.tripPlan);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Draft deleted")),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Failed to delete draft: ${e.toString().replaceAll("Exception: ", "")}"), backgroundColor: Colors.red),
                  );
                }
              } finally {
                if (mounted) {
                  setState(() {
                    _isDeleting = false;
                  });
                }
              }
            },
          ),
          TextButton(
            child: const Text("Cancel"),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );''')

text = text.replace('''      child: AdaptiveContextMenu(
        actions: [
          AdaptiveContextMenuAction(
            title: "Post to Feed",
            icon: Icons.send_rounded,
            onPressed: () {
              if (!_isPosting && !_isDeleting) {
                _handlePostDraft();
              }
            },
          ),
          AdaptiveContextMenuAction(
            title: "Delete Draft",
            icon: Icons.delete_outline_rounded,
            onPressed: () {
              if (!_isPosting && !_isDeleting) {
                _handleDeleteDraft();
              }
            },
          ),
        ],''', '''      child: PopupMenuButton(
        itemBuilder: (context) => [
          PopupMenuItem(
            child: Row(children: const [Icon(Icons.send_rounded), SizedBox(width: 8), Text("Post to Feed")]),
            onTap: () {
              if (!_isPosting && !_isDeleting) {
                _handlePostDraft();
              }
            },
          ),
          PopupMenuItem(
            child: Row(children: const [Icon(Icons.delete_outline_rounded), SizedBox(width: 8), Text("Delete Draft")]),
            onTap: () {
              if (!_isPosting && !_isDeleting) {
                _handleDeleteDraft();
              }
            },
          ),
        ],''')

with open('lib/features/profile/presentation/widgets/draft_trip_plan_card.dart', 'w') as f:
    f.write(text)
