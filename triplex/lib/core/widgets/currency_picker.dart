import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/outline_text_field.dart';

Future<Currency?> showCurrencyBottomIOS(BuildContext context) async {
  final CurrencyService service = CurrencyService.instance;
  final List<Currency> currencies = service.getAll();
  final Size screenSize = MediaQuery.of(context).size;

  return await showModalBottomSheet<Currency>(
    constraints: BoxConstraints(
        minHeight: screenSize.height * 0.75, maxHeight: screenSize.height),
    useRootNavigator: true,
    showDragHandle: false,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.transparent,
    context: context,
    isScrollControlled: true,
    builder: (BuildContext context) {
      return _CurrencyBottomSheet(currencies: currencies);
    },
  );
}

class _CurrencyBottomSheet extends StatefulWidget {
  final List<Currency> currencies;
  const _CurrencyBottomSheet({required this.currencies});

  @override
  State<_CurrencyBottomSheet> createState() => _CurrencyBottomSheetState();
}

class _CurrencyBottomSheetState extends State<_CurrencyBottomSheet> {
  late List<Currency> _filteredCurrencies;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _filteredCurrencies = widget.currencies;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(
          top: 30,
          left: 16,
          right: 16,
          bottom: bottomInset > 0 ? bottomInset : 30),
      child: Container(
        width: screenSize.width,
        height: screenSize.height * 0.75,
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.only(bottom: 10, top: 20),
          child: Stack(
            children: [
              ListView(
                padding: const EdgeInsets.only(top: 60),
                children: _filteredCurrencies.map((currency) {
                  return ListTile(
                    leading: CurrencyAssetFlagCircular(currency: currency),
                    title: Text(currency.name,
                        style: const TextStyle(fontSize: 12)),
                    subtitle: Text(currency.code,
                        style: const TextStyle(fontSize: 10)),
                    trailing: Text(currency.symbol,
                        style: const TextStyle(fontSize: 16)),
                    onTap: () {
                      context.pop(currency);
                    },
                  );
                }).toList(),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: OutlineTextField(
                  controller: _searchController,
                  hint: "Search",
                  padding: EdgeInsets.zero,
                  borderless: true,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (value) {
                    setState(() {
                      _filteredCurrencies = widget.currencies
                          .where((currency) =>
                              currency.name
                                  .toLowerCase()
                                  .contains(value.toLowerCase()) ||
                              currency.code
                                  .toLowerCase()
                                  .contains(value.toLowerCase()))
                          .toList();
                    });
                  },
                  onChanged: (value) {
                    setState(() {
                      _filteredCurrencies = widget.currencies
                          .where((currency) =>
                              currency.name
                                  .toLowerCase()
                                  .contains(value.toLowerCase()) ||
                              currency.code
                                  .toLowerCase()
                                  .contains(value.toLowerCase()))
                          .toList();
                    });
                  },
                ).liquidGlass(interactive: true),
              ),
            ],
          ),
        ),
      ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 32),
    );
  }
}
