import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
const { height, width } = Dimensions.get('window')
import settings from '../AppSettings'
import { connect } from 'react-redux';
import { selectTheme } from '../actions';
const gradients = settings.gradients
const primaryColor = settings.primaryColor
const secondaryColor = settings.secondaryColor
const fontFamily = settings.fontFamily
const themeColor = settings.themeColor
const url = settings.url
const screenHeight = Dimensions.get('screen').height;
import { StatusBar, } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import orders from '../data/orders'
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons, Entypo, Fontisto, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import HttpsClient from '../HttpsClient';
import Modal from "react-native-modal";
import DropDownPicker from 'react-native-dropdown-picker';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { BluetoothManager, BluetoothEscposPrinter, BluetoothTscPrinter, } from 'react-native-bluetooth-escpos-printer';
import moment from 'moment';
const orderStatus = [
    {
        label: "Completed",
        value: "Completed"
    },
    {
        label: "Declined",
        value: "Declined"
    },
]
const paymentStatus = [
    {
        label: "Paid",
        value: "Paid"
    },
    {
        label: "NotPaid",
        value: "NotPaid"
    },
]
class ViewOrders2 extends Component {
    constructor(props) {
        let item = props.route.params.item
        super(props);
        this.state = {
            item,
            modal: false,
            open: false,
            ordervalue: orderStatus[0].value,
            open2: false,
            paymentvalue: paymentStatus[0].value,
        };
    }
    getSubtotal = () => {
        let total = 0
        this.state.item.items.forEach((item) => {
            total += item.quantity
        })
        return total
    }
    print = async () => {
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText("Drools\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 3,
            heigthtimes: 3,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText("# 109 , Ground floor , 5th main corner , 60 ft road , AGB layout, Hesaragatta road\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.printText("Bangalore 560090\n\r", {});
        await BluetoothEscposPrinter.printText("PHONE:8976979769\n\r", {});
        await BluetoothEscposPrinter.printText("GSTIN:GDFTJLPHF3534\n\r", {});
        await BluetoothEscposPrinter.printText("\n\r", {});
        let columnWidths = [16, 16]
        await BluetoothEscposPrinter.printColumn(columnWidths,
            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
            [`BILLNO:${this.state.item.id}`, `DATE:${moment(this.state.item.created).format("DD/MM/YYYY")}`], { fonttype: 0 });
        await BluetoothEscposPrinter.printText("\n\r", {});
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        let columnWidts = [10, 6, 8, 8]
        await BluetoothEscposPrinter.printColumn(columnWidts,
            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
            ["ITEM", 'QTY', 'Price', 'Amt'], {});
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        this.state.item.items.forEach(async (i) => {
            let columnWidth = [10, 6, 8, 8]
            await BluetoothEscposPrinter.printColumn(columnWidth,
                [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                [`${i.itemTitle}`, `${i.quantity}`, `${i.item_price}`, `${i.total_price}`], {});
        })
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        let columnWidth4 = [10, 6, 8, 8]
        await BluetoothEscposPrinter.printColumn(columnWidth4,
            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
            ["SUBTOTAL", `${this.getSubtotal()}`, '', `${this.state.item.total_price}`], {});
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

        this.state.item.items.forEach(async (i) => {
            let columnWidth = [9, 12, 11]
            await BluetoothEscposPrinter.printColumn(columnWidth,
                [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                [``, `CGST @9.00%`, `2.916.80`], {});
        })
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        let columnWidth5 = [16, 16]
        await BluetoothEscposPrinter.printColumn(columnWidth5,
            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
            ["TOTAL", "Rs.1,000.00"], { fonttype: 0 });
        await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});
        await BluetoothEscposPrinter.printText("\n\r", {});
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText("THANK YOU\n\r", {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.printText("\n\r", {});
        await BluetoothEscposPrinter.printText("\n\r", {});
        await BluetoothEscposPrinter.printText("\n\r", {});
    }
    showSimpleMessage(content, color, type = "info", props = {}) {
        const message = {
            message: content,
            backgroundColor: color,
            icon: { icon: "auto", position: "left" },
            type,
            ...props,
        };

        showMessage(message);
    }

    getOrders = async () => {
        let api = `${url}/api/drools/cart/${this.state.item.id}/`
        const data = await HttpsClient.get(api)

        if (data.type == "success") {
            this.setState({ item: data.data })
        }
    }
    completeOrder = async () => {
        let api = `${url}/api/drools/createOrder/`
        let sendData = {
            status: this.state.ordervalue,
            payment_status: this.state.paymentvalue,
            cart_id: this.state.item.id
        }
        let post = await HttpsClient.post(api, sendData)
        console.log(post)
        if (post.type == "success") {
            this.setState({ modal: false })
            this.showSimpleMessage("Order Saved SuccessFully", "green", "success")
            return this.props.navigation.goBack()
        } else {

            this.showSimpleMessage(`${post.data.failed}`, "red", "failure")
        }
    }
    componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.getOrders()

        });
    }
    componentWillUnmount() {
        this._unsubscribe()
    }
    footer = () => {
        return (
            <View style={{ marginVertical: 10 }}>
                <View style={{ flexDirection: "row", height: height * 0.06, margin: 10 }}>
                    <View style={{ flex: 0.2 }}>

                    </View>
                    <View style={{ flex: 0.6, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Total :</Text>
                        </View>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Actual Price :</Text>
                        </View>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Money Saved :</Text>
                        </View>
                    </View>
                    <View style={{ flex: 0.2, alignItems: "center", justifyContent: "center" }}>
                        <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>₹ {this.state.item.cart_bill}</Text>
                        <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>₹ {this.state.item.total_price}</Text>
                        <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>₹ {this.state.item.money_saved}</Text>
                    </View>
                </View>
                {/* <View style={{ alignItems: "center", marginTop: 20, flexDirection: "row", justifyContent: "space-around" }}>
                    <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: primaryColor }}
                        onPress={() => { this.setState({ modal: true }) }}
                    >
                        <Text style={[styles.text, { color: "#fff" }]}>Complete Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: primaryColor }}
                        onPress={() => { this.props.navigation.navigate('SearchDishes2', { item: this.state.item }) }}
                    >
                        <Text style={[styles.text, { color: "#fff" }]}>Add Items</Text>
                    </TouchableOpacity>
                </View> */}
                <View style={{ alignItems: "center", justifyContent: "center", marginVertical: 30, flexDirection: "row" }}>
                    <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: "green" }}
                        onPress={() => { this.print() }}
                    >
                        <Text style={[styles.text, { color: "#fff" }]}>Print</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", marginLeft: 10 }}>
                        <View>
                            <Text style={[styles.text, { color: "#fff" }]}>status:</Text>
                        </View>

                        <View style={{ marginLeft: 10, width: 10, height: 10, backgroundColor: this.props.bluetooth ? "green" : "red", borderRadius: 10, marginTop: 5 }}>

                        </View>
                    </View>
                </View>
            </View>
        )
    }
    setOpen = (open) => {
        this.setState({
            open
        });
    }

    setValue = (callback) => {

        this.setState(state => ({
            ordervalue: callback(state.value)
        }));
    }

    setItems = (callback) => {

        this.setState(state => ({
            items: callback(state.items)
        }));
    }
    setOpen2 = (open2) => {
        this.setState({
            open2
        });
    }

    setValue2 = (callback) => {

        this.setState(state => ({
            paymentvalue: callback(state.value)
        }));
    }

    setItems2 = (callback) => {

        this.setState(state => ({
            items: callback(state.items)
        }));
    }
    completeModal = () => {
        return (
            <Modal
                statusBarTranslucent={true}
                isVisible={this.state.modal}
                deviceHeight={screenHeight}
                onBackdropPress={() => { this.setState({ modal: false }) }}
            >
                <View style={{}}>

                    <View style={{ height: height * 0.5, backgroundColor: "#fff", borderRadius: 5, alignItems: "center", justifyContent: "space-around" }}>
                        <View>
                            <Text style={[styles.text, { color: "#000", fontSize: 22 }]}>Order Status :</Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <DropDownPicker
                                style={{ height: height * 0.05 }}
                                containerStyle={{ height: height * 0.05 }}
                                open={this.state.open}
                                value={this.state.ordervalue}
                                items={orderStatus}
                                setOpen={this.setOpen}
                                setValue={this.setValue}
                                setItems={this.setItems}
                                placeholder="select a Table"
                            />
                        </View>
                        <View>
                            <Text style={[styles.text, { color: "#000", fontSize: 22 }]}>Payment Status :</Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <DropDownPicker
                                style={{ height: height * 0.05 }}
                                containerStyle={{ height: height * 0.05 }}
                                open={this.state.open2}
                                value={this.state.paymentvalue}
                                items={paymentStatus}
                                setOpen={this.setOpen2}
                                setValue={this.setValue2}
                                setItems={this.setItems2}
                                placeholder="select a Table"
                            />
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: primaryColor }}
                                onPress={() => {
                                    this.completeOrder()
                                }}
                            >
                                <Text style={[styles.text, { color: "#fff" }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>



                </View>

            </Modal>
        )
    }
    render() {

        return (
            <View style={{ flex: 1, backgroundColor: themeColor }}>
                <StatusBar style={"light"} />
                {/* Headers */}
                <LinearGradient
                    style={{ height: height * 0.12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                    colors={gradients}
                >
                    <View style={{ marginTop: Constants.statusBarHeight, flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 0.2, alignItems: "center", justifyContent: "center" }}
                            onPress={() => { this.props.navigation.goBack() }}
                        >
                            <Ionicons name="caret-back" size={24} color={secondaryColor} />
                        </TouchableOpacity>
                        <View style={{ flex: 0.6, alignItems: "center", justifyContent: "center" }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>Order Details</Text>

                        </View>
                        <View style={{ flex: 0.2, alignItems: "center", justifyContent: "center" }}>

                        </View>
                    </View>
                </LinearGradient>

                <FlatList
                    style={{ marginTop: 20 }}
                    data={this.state.item.items}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={this.footer()}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{ height: height * 0.1, margin: 15, borderColor: "#E6E9F0", borderBottomWidth: 0.5, flexDirection: "row" }}>
                                <View style={{ flex: 0.2, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                    <View style={[styles.boxWithShadow, { height: 25, width: 25, backgroundColor: "#333", alignItems: "center", justifyContent: "center" }]}>
                                        <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>{item.quantity}</Text>
                                    </View>
                                    <View style={{ marginLeft: 5 }}>
                                        <Text style={[styles.text, { color: "#fff" }]}>X</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.text, { color: "#fff" }]}> ₹ {item.item_price}-{item.discount_price}</Text>
                                    </View>
                                </View>
                                <View style={{ flex: 0.6, alignItems: "center", justifyContent: "center" }}>
                                    <View>
                                        <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>{item.itemTitle}</Text>
                                    </View>
                                    {/* <View>
                                        <Text style={[styles.text, { color: "#fff" }]}>1 plate | ₹ {item.itemPrice}</Text>
                                    </View> */}
                                </View>
                                <View style={{ flex: 0.2, alignItems: "center", justifyContent: "center" }}>
                                    <View>
                                        <Text style={[styles.text, { color: primaryColor, fontSize: 22 }]}>₹ {item.total_price}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                />

                {
                    this.completeModal()
                }
            </View>

        );
    }
}
const styles = StyleSheet.create({
    text: {
        fontFamily
    },
    boxWithShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5
    }
})
const mapStateToProps = (state) => {

    return {
        theme: state.selectedTheme,
        bluetooth: state.bluetoothStatus
    }
}
export default connect(mapStateToProps, { selectTheme })(ViewOrders2);