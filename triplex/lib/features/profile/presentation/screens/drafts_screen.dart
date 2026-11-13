import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/profile/domain/draft_trip_plans_notifier.dart';
import 'package:triplex/features/profile/presentation/widgets/draft_trip_plan_card.dart';

class DraftsScreen extends ConsumerWidget {
  const DraftsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draftsState = ref.watch(draftTripPlansProvider);
    final topPadding = MediaQuery.paddingOf(context).top + kToolbarHeight;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Drafts"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            }
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              ref.read(draftTripPlansProvider.notifier).refresh();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          RefreshIndicator.adaptive(
            onRefresh: () =>
                ref.read(draftTripPlansProvider.notifier).refresh(),
            edgeOffset: topPadding,
            child: draftsState.when(
              data: (drafts) {
                if (drafts.isEmpty) {
                  return ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SizedBox(height: topPadding + 40),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(28),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .primary
                                      .withAlpha(25),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.drafts_outlined,
                                  size: 44,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const TextH5(
                                "No Drafts Yet",
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                "Trip plans you save as draft will appear here. You can post them to your feed or delete them anytime.",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurfaceVariant,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      ),
                    ],
                  );
                }

                return ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.fromLTRB(16, topPadding + 8, 16, 40),
                  itemCount: drafts.length,
                  itemBuilder: (context, index) {
                    return DraftTripPlanCard(tripPlan: drafts[index]);
                  },
                );
              },
              error: (err, stack) => ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: topPadding + 40),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(28),
                        child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline_rounded,
                            size: 48,
                            color: Theme.of(context).colorScheme.error,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            "Failed to load drafts",
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            "$err",
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 16),
                          CupertinoButton.filled(
                            borderRadius: BorderRadius.circular(24),
                            onPressed: () => ref
                                .read(draftTripPlansProvider.notifier)
                                .refresh(),
                            child: const Text("Retry"),
                          ),
                        ],
                      ),
                    ),
                  ),
                  ),
                ],
              ),
              loading: () => const Center(
                child: CircularProgressIndicator.adaptive(),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}
