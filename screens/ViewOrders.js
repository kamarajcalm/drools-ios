import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, FlatList, Image ,TextInput, ScrollView,Switch, ActivityIndicator, Linking} from 'react-native';
const { height, width } = Dimensions.get('window')
import settings from '../AppSettings'
import { connect } from 'react-redux';
import { selectTheme ,setOnePlusOne} from '../actions';
const gradients = settings.gradients
const primaryColor = settings.primaryColor
const secondaryColor = settings.secondaryColor
const fontFamily = settings.fontFamily
const themeColor = settings.themeColor
const url =settings.url
const screenHeight =Dimensions.get('screen').height;
import { StatusBar, } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import orders from '../data/orders'
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons, Entypo, Fontisto, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import HttpsClient from '../HttpsClient';
import Modal from "react-native-modal";
import DropDownPicker from 'react-native-dropdown-picker';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";

import moment from 'moment';
import base64Image from '../assets/base64/drools';
const orderStatus =[
    {
        label:"Completed",
        value:"Completed"
    },
    {
        label: "Declined",
        value: "Declined"
    },
]
const paymentStatus =[
    {
        label: "Paid",
        value: "Paid"
    },
    {
        label: "NotPaid",
        value: "NotPaid"
    },
]
const paymentMode = [
    {
        label: "Cash",
        value: "Cash"
    },

    {
        label: "Phonepe",
        value: "Phonepe"
    },
    {
        label: "Online",
        value: "Online"
    },
    {
        label: "Personal1",
        value: "Personal1"
    },
    {
        label: "Personal2",
        value: "Personal2"
    },
]
class ViewOrders extends Component {
    constructor(props) {
        let item = props.route.params.item
        super(props);
        this.state = {
            item,
            modal:false,
            open: false,
            ordervalue:orderStatus[0].value,
            open2: false,
            paymentvalue:paymentStatus[0].value,
            discount:"",
            onlineDiscount:"",
            takeAwayDiscount:"",
            diningDiscount:"",
            oneplus:false,
            paymentmode:null,
            refreshing:false,
        };
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
        console.log(api)
        if (data.type == "success") {
            this.setState({ item: data.data })
        }
    }
    completeOrder =async()=>{
        this.setState({creating:true})
        let api = `${url}/api/drools/createOrder/`
        let sendData ={
            status:this.state.ordervalue,
            payment_status:this.state.paymentvalue,
            cart_id:this.state.item.id,
            discount:Number(this.state.discount),
            payment_mode:this.state.paymentmode
        }
        if (this.props.oneplusOne){
            sendData.oneplusone="ttt"
        }
        let post = await HttpsClient.post(api,sendData)
        console.log(post)
        if(post.type=="success"){
            this.setState({modal:false})
            this.setState({ creating: false })
            this.showSimpleMessage("Order Saved SuccessFully", "green","success")
            this.getOrders();
        }else{
            this.setState({ creating: false })
            this.showSimpleMessage(`${post?.data?.failed||"try again"}`, "red", "failure")
        }
    }
    getSubtotal =()=>{
        let total =0
        this.state.item.items.forEach((item)=>{
           total +=  item.quantity
        })
        return total
    }

    getDiscount = async()=>{
        let api = `${url}/api/drools/droolsDiscount/1/`
        let data = await HttpsClient.get(api)
        if (data.type == "success") {
            if (this.state.item.order_type =="Dining"){
                this.setState({ discount:data.data.online_discount.toString()})
            }
            if (this.state.item.order_type == "Takeaway") {
                this.setState({ discount: data.data.takeaway_discount.toString()})
            }
            if (this.state.item.order_type == "Online"){
                this.setState({ discount: data.data.takeaway_discount.toString() })
            }
        }
    }
    componentDidMount(){
        this.getDiscount()
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.getOrders()
        });
    }
    componentWillUnmount(){
       
        this._unsubscribe()
    }
    enableOffer =async()=>{
        let api = `${url}/api/drools/createOrder/`
        let sendData = {
            oneplusone:true,
            cart_id: this.state.item.id,
           
        }
        let post = await HttpsClient.post(api, sendData)
        console.log(post)
        if (post.type == "success") {
           
            this.showSimpleMessage("Enabled SuccessFully", "green", "success")
      
        } else {

            this.showSimpleMessage(`${post?.data?.failed}`, "red", "failure")
        }
    }
    acceptOrder = async()=>{
        let api = `${url}/api/drools/cart/${this.state.item.id}/`
          let sendData ={
              is_accepted: !this.state.item.is_accepted
          }
        let patch = await HttpsClient.patch(api,sendData)
        if(patch.type=="success"){
            let duplicate = this.state.item
            duplicate.is_accepted =!duplicate.is_accepted
            this.setState({ item: duplicate})
            this.showSimpleMessage(`${duplicate.is_accepted?"Accepted":"rejected"} successfully`,"green","success")

        }else{
            this.showSimpleMessage("Try Again", "green", "success")
        }
    }
            callNumber = phone => {
  console.log('callNumber ----> ', phone);
  let phoneNumber = phone;
  if (Platform.OS !== 'android') {
    phoneNumber = `telprompt:${phone}`;
  }
  else  {
    phoneNumber = `tel:${phone}`;
  }
  Linking.canOpenURL(phoneNumber)
  .then(supported => {
    if (!supported) {
      Alert.alert('Phone number is not available');
    } else {
      return Linking.openURL(phoneNumber);
    }
  })
  .catch(err => console.log(err));
};
    footer =()=>{
        return(
            <View style={{marginVertical:10}}>
               <View style={{flexDirection:"row",height:height*0.06,margin:10}}>
                    <View style={{ flex: 0.2 }}>

                    </View>
                    <View style={{ flex: 0.5, alignItems: "center", justifyContent: "center"}}>
                        <View style={{ alignSelf: "flex-end", marginRight:20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>bill :</Text>
                        </View>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>GST :</Text>
                        </View>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>total price :</Text>
                        </View>
                        <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Money Saved :</Text>
                        </View>
                    </View>
                    <View style={{flex:0.3,alignItems:"center",justifyContent:"center"}}>
                        {this.state.item.cart_status!="Completed"?<Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {parseFloat(this.state.item.cart_bill*100/105).toFixed(3)}</Text>:
                        
                            <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {this.state.item.cart_bill}</Text>
                        }
                        {this.state.item.cart_status != "Completed" ? <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {parseFloat((this.state.item.cart_bill*100/105)*5/100).toFixed(3)} </Text>:
                            <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {this.state.item.gst}</Text>
                      }
                        <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {this.state.item.total_price}</Text>
                        <Text style={[styles.text, { color: primaryColor, fontSize: 25 }]}>??? {this.state.item.money_saved}</Text>
                    </View>
                </View>
                 <View style={{marginVertical:10,marginLeft:10}}>
                     <Text style={[styles.text,{color:"#fff"}]}>Enter Discount %</Text>
                     <View style={{marginVertical:10}}>
                        <TextInput 
                          keyboardType={"numeric"}
                          style={{height:38,width:width*0.8,backgroundColor:"#fff",paddingLeft:10}}
                          selectionColor={primaryColor}
                          onChangeText={(discount) => {this.setState({ discount})}}
                          value={this.state.discount}
                       
                        />
                     </View>
                </View> 
              {this.state.item.cart_status!="Completed"&& <View style={{alignItems:"center",marginTop:20,flexDirection:"row",justifyContent:"space-around",flexWrap:"wrap"}}>
                    <TouchableOpacity style={{height:height*0.05,width:width*0.4,alignItems:"center",justifyContent:"center",backgroundColor:primaryColor}}
                     onPress={()=>{this.setState({modal:true})}}
                    >
                        <Text style={[styles.text,{color:"#fff"}]}>Complete Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: primaryColor }}
                        onPress={() => { this.props.navigation.navigate('SearchDishes2',{item:this.state.item})}}
                    >
                        <Text style={[styles.text, { color: "#fff" }]}>Add Items</Text>
                    </TouchableOpacity>
              
                </View>}
                {
                    this.state.item.order_type == "Takeaway" && 
                    <View style={{alignItems:"center",justifyContent:"center",marginTop:20}}>
                        <TouchableOpacity style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: this.state.item.is_accepted?"red":"green"}}
                            onPress={() => { this.acceptOrder()}}
                        >
                            <Text style={[styles.text, { color: "#fff" }]}>{this.state.item.is_accepted?"Reject":"Accept"}</Text>
                        </TouchableOpacity>
                    </View>
                   
                }
                {this.state.item.cart_status == "Completed"&& <View style={{alignItems:"center",justifyContent:"center",marginVertical:30,flexDirection:"row"}}>
                   

                    <View style={{ flexDirection: "row" ,marginLeft:10}}>
                        <View>
                            <Text style={[styles.text, { color: "#fff" }]}>status:</Text>
                        </View>
                     
                        <View style={{ marginLeft: 10, width: 10, height: 10, backgroundColor: this.props.bluetooth ? "green" : "red" ,borderRadius:10,marginTop:5}}>

                        </View>
                    </View>
                </View>}
                {
                    this.state.item.order_type =="Takeaway"&&
                    <View>

            
                    <View style={{ flexDirection: "row", height: height * 0.06, margin: 20 }}>
                        <View style={{ flex: 0.2 }}>

                        </View>
                        <View style={{ flex: 0.4, alignItems: "center", justifyContent: "center" }}>
                            <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                                <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Name :</Text>
                            </View>
                            <View style={{ alignSelf: "flex-end", marginRight: 20 }}>
                                <Text style={[styles.text, { color: "#fff", fontSize: 22, }]}>Mobile :</Text>
                            </View>
                           
                        </View>
                        <View style={{ flex: 0.4, alignItems: "center", justifyContent: "center" }}>
                            <View>
                                <Text style={[styles.text, { color: primaryColor, fontSize: 22 }]}> {this.state.item.customer_name}</Text>
                            </View>
                             <TouchableOpacity 
                             onPress={()=>{
                                 this.callNumber(this.state.item.customer_mobile)
                             }}
                            >
                                 <View>
                                              <Text style={[styles.text, { color: primaryColor, fontSize: 22 }]}> {this.state.item.customer_mobile}</Text>
                                 </View>
                      
                            </TouchableOpacity>
                            
                  
                        </View>
                    </View>
                    <View>
                        <View style={{alignItems:"center",justifyContent:"center"}}>
                                <Text style={[styles.text,{color:primaryColor,fontSize:22,textDecorationLine:"underline"}]}>Address:</Text>
                        </View>
                        <View style={{marginVertical:10,paddingHorizontal:10}}>
                                <Text style={[styles.text,{color:"#fff",fontSize:22}]}>{this.state.item.customer_address}</Text>
                        </View>
                    </View>
                    </View>
                }
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
    setOpen3 = (open3) => {
        this.setState({
            open3
        });
    }

    setValue3 = (callback) => {

        this.setState(state => ({
            paymentmode: callback(state.value)
        }));
    }

    setItems3 = (callback) => {

        this.setState(state => ({
            items: callback(state.items)
        }));
    }
    refresh =()=>{
        this.getOrders()
    }
    toggleSwitch =()=>{
        this.props.setOnePlusOne(!this.props.oneplusOne)
    }
    completeModal = ()=>{
        return(
            <Modal
                statusBarTranslucent ={true}
                isVisible={this.state.modal}
                deviceHeight={screenHeight}
                onBackdropPress={() => { this.setState({ modal: false }) }}
            >
                <View style={{ }}>

                    <View style={{height:height*0.7,backgroundColor:"#fff",borderRadius:5,alignItems:"center",justifyContent:"space-around"}}>
                        <View>
                            <Text style={[styles.text, { color: "#000", fontSize: 22 }]}>Paid By :</Text>
                        </View>
                        <View style={{ marginTop: 10, width: width * 0.7, height: this.state.open3 ? height * 0.3 : height * 0.08 }}>
                            <DropDownPicker
                                style={{ height: height * 0.05 }}
                                containerStyle={{ height: height * 0.05 }}
                                open={this.state.open3}
                                value={this.state.paymentmode}
                                items={paymentMode}
                                setOpen={this.setOpen3}
                                setValue={this.setValue3}
                                setItems={this.setItems3}
                                placeholder="select a mode"
                            />
                        </View>
                        <View>
                            <Text style={[styles.text,{color:"#000",fontSize:22}]}>Order Status :</Text>
                        </View>
                        <View style={{ marginTop: 10 ,width:width*0.7,height:this.state.open?height*0.2:height*0.08}}>
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
                        <View style={{ marginTop: 10, width: width * 0.7, height: this.state.open2 ? height * 0.2 : height * 0.08}}>
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
                   
                        <Text style={[styles.text, { color: "#000", fontSize: 22 }]}>Enable 1 + 1 </Text>

                        <Switch
                            style={{ marginLeft: 10 }}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={this.props.oneplusOne? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => { this.toggleSwitch() }}
                            value={this.props.oneplusOne}
                        />
                        <View style ={{alignItems:"center"}}>
                            {!this.state.creating ?<TouchableOpacity style ={{height:height*0.05,width:width*0.4,alignItems:"center",justifyContent:"center",backgroundColor:primaryColor}}
                             onPress ={()=>{
                                 this.completeOrder()
                             }}
                            >
                              <Text style ={[styles.text,{color:"#fff"}]}>Save</Text>
                            </TouchableOpacity> :
                                <View style={{ height: height * 0.05, width: width * 0.4, alignItems: "center", justifyContent: "center", backgroundColor: primaryColor }}>
                                        <ActivityIndicator size={"large"} color={"#fff"}/>
                            </View>}
                        </View>
                    </View>



                </View>

            </Modal>
        )
    }
    validateColor =(item)=>{
        if (item.item_status =="Pending"){
            return "orange"
        }
        if (item.item_status == "Finished") {
            return "green"
        }
        return "red"
    }
    editCart = async()=>{
        let api = `${url}/api/drools/addCart/`
        let sendData = {
            items: [],
            cart: this.state.item.id,
            edit_cart: true
        }

        let post = await HttpsClient.post(api, sendData)
        console
        if (post.type == "success") {
            this.getOrders();
            this.setState({ changing: false, })
        }
    }
    decreaseQuantity = async(item,index)=>{
        
        this.setState({ changing: true, index })
        let api = `${url}/api/drools/cartitems/${item.id}/`
        if(item.quantity==1){
            let api2 = `${url}/api/drools/cartitems/${item.id}/`
            let del = await HttpsClient.delete(api)
            if (del.type == "success") {
              this.editCart()
              
            } else {
                this.showSimpleMessage("Try Again", "red", "danger")
                this.setState({ changing: false })
            }
        }else{
            let sendData = {
                quantity: item.quantity - 1,
                total_price: item.item_price * (item.quantity - 1)
            }
            let patch = await HttpsClient.patch(api, sendData)

            if (patch.type == "success") {
                this.editCart()
            } else {
                this.showSimpleMessage("Try Again", "red", "danger")
                this.setState({ changing: false })
            }
        }
     

    }
    addQuantity =async(item,index)=>{
        this.setState({changing:true,index})
        let api = `${url}/api/drools/cartitems/${item.id}/`
        let sendData ={
            quantity:item.quantity+1,
            total_price: item.item_price * (item.quantity + 1)
        }
  
        let patch = await HttpsClient.patch(api, sendData)
       
        if(patch.type=="success"){
            this.editCart()
        }else{
            this.showSimpleMessage("Try Again","red","danger")
            this.setState({ changing: false })
        }
    }
    validateButton =(item,index)=>{
        if(this.state.changing&&index==this.state.index){
            return(
                <ActivityIndicator size={"large"} color={"#fff"} />
            )
        }
        return(
            <Text style={[styles.text, { color: "#ffff", fontSize: 20 }]}>{item.quantity}</Text>
        )
    }
    render() {
         console.log(this.props.bluetoothStatus,"bluuruu")
        return (
            <View style={{ flex: 1, backgroundColor: themeColor }}>
                <StatusBar style={"light"} />
                {/* Headers */}
                <LinearGradient
                    style={{ height: height * 0.12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                    colors={gradients}
                >
                    <View style={{ marginTop: Constants.statusBarHeight ,flex:1,flexDirection:"row"}}>
                        <TouchableOpacity style={{flex:0.2,alignItems:"center",justifyContent:"center"}}
                         onPress={()=>{this.props.navigation.goBack()}}
                        >
                            <Ionicons name="caret-back" size={24} color={secondaryColor} />
                        </TouchableOpacity>
                        <View style={{flex:0.6,alignItems:"center",justifyContent:"center"}}>
                            <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>Order Details</Text>

                        </View>
                        <View style={{flex:0.2,alignItems:"center",justifyContent:"center"}}>

                        </View>
                    </View>
                </LinearGradient>
                <ScrollView>

          
               <FlatList 
                    refreshing={this.state.refreshing}
                    onRefresh ={()=>{this.refresh()}}
                    style={{marginTop:20}}
                    data={this.state.item.items}
                    keyExtractor ={(item,index)=>index.toString()}
                    ListFooterComponent={this.footer()}
                    renderItem ={({item,index})=>{
                        return(
                            <View style={{ height: height * 0.15, margin: 15, borderColor:"#E6E9F0",borderBottomWidth:0.5,flexDirection:"row"}}>
                                <View style={{flex:0.2,alignItems:"center",justifyContent:"center",flexDirection:"row"}}>
                                    <View style={[styles.boxWithShadow,{height:25,width:25,backgroundColor:"#333",alignItems:"center",justifyContent:"center"}]}>
                                        <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>{item.quantity}</Text>
                                    </View>
                                    <View style={{marginLeft:5}}>
                                        <Text style={[styles.text,{color:"#fff"}]}>X</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.text, { color: "#fff" }]}> ??? {item.item_price}-{item.discount_price}</Text>
                                    </View>
                                </View>
                                <View style={{flex:0.6,alignItems:"center",justifyContent:"center"}}>
                                    <View>
                                        <Text style={[styles.text, { color: "#fff", fontSize: 18 }]}>{item.itemTitle}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.text, { color: this.validateColor(item) }]}> {item.item_status}</Text>
                                    </View>
                                    {this.state.item.cart_status != "Completed" && item.item_status=="Pending"&&<View style={{flexDirection:"row",flex:1,alignItems:"center",justifyContent:"space-around"}}>
                                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}
                                            onPress={() => {
                                                this.decreaseQuantity(item, index)
                                            }}
                                        >
                                            <Entypo name="circle-with-minus" size={24} color={primaryColor} />
                                        </TouchableOpacity>
                                        <View style={{ alignItems: "center", justifyContent: "center",marginLeft:10}}>
                                            {
                                                this.validateButton(item,index)
                                            }
                                          
                                        </View>
                                        <TouchableOpacity style={{ alignItems: "center", justifyContent: "center",marginLeft:10}}
                                            onPress={() => {
                                                this.addQuantity(item, index)
                                            }}
                                        >
                                            <Entypo name="circle-with-plus" size={24} color={primaryColor} />
                                        </TouchableOpacity>

                                    </View>}
                                </View>
                                <View style={{flex:0.2,alignItems:"center",justifyContent:"center",flexDirection:"row"}}>
                                      <View>
                                        <Text style={[styles.text, { color: primaryColor, fontSize: 22 }]}>??? {parseFloat((item.item_price * 100/105)*( item.quantity)).toFixed(3)}</Text>
                                    </View>
                                   
                                   
                                </View>
                            </View>
                        )
                    }}
               />

              {
                  this.completeModal()
              }
                </ScrollView>
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
        bluetooth:state.bluetoothStatus,
        oneplusOne: state.onePlusOne
    }
}
export default connect(mapStateToProps, { selectTheme, setOnePlusOne})(ViewOrders);