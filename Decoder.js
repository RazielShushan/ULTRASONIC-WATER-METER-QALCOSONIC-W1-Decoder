
function byteToHex(b) {
    var hex = b.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function bytesToHex(bytes,offset,amount) {
    var hexToReturn = "";
    for(var i = offset + amount-1; i >= offset; i--){
    hexToReturn += byteToHex(bytes[i]);
    }
    console.log(hexToReturn);
    return hexToReturn ;
}
function hexToDecimal(hexString) {
    return parseInt(hexString, 16);
}

function statusAxiomaShort(s) {
	var returnState;
	switch(s) {
		case '00': returnState = 'OK'; break;
		case '04': returnState = 'Low battery'; break;
		case '08': returnState = 'Permanent error'; break;
		case '10': returnState = 'Dry'; break;
		case '70': returnState = 'Backflow'; break;
		case 'D0': returnState = 'Manipulation'; break;
		case 'B0': returnState = 'Burst'; break;
		case '30': returnState = 'Leakage'; break;
		case '90': returnState = 'Low temperature'; break;
	}
	return  returnState;
}

function bin2HexStr(arr)
 
{
    var str = "";
    for(var i=0; i<arr.length; i++)
    {

       var tmp = arr[i].toString(16);
       if(tmp.length == 1)
       {
           tmp = "0" + tmp;
       }
       tmp = "0x" + tmp;
       if (i != arr.length - 1) {
           tmp += ",";
       }
       str += tmp;
    }
    return str;
}

function decodeAxiomaExtended(bytes) {
    var params = {
        "curentDate": null,
        "statusCode": null,
        "statusMessage": null,
        "logCurrentVolume1": null,
        "logDateCurrentVolume":null,
        "logCurrentVolume2": null,
        "pastVolumesAndTimes": null,
        "paddingByte": null,
        "error": null,
        "decode_data_hex": bin2HexStr(bytes),
        "bytes": bytes
    }
	var epoch,log_date_epoch, state, volume1,volume2, padding_byte;
	var pastVolumes = [];
	var i = 0;
	var error;

	try {
		epoch = hexToDecimal(bytesToHex(bytes,i,4)); i+=4;
		state = bytesToHex(bytes,i,1); i+=1;
		volume1 = hexToDecimal(bytesToHex(bytes,i,4)); i+=4;
        log_date_epoch = hexToDecimal(bytesToHex(bytes,i,4)); i+=4;
        volume2 = hexToDecimal(bytesToHex(bytes,i,4)); i+=4;
        while (i < bytes.length-1) {
			pastVolumes.push(hexToDecimal(bytesToHex(bytes,i,2))); i += 2;
		}
		padding_byte = hexToDecimal(bytesToHex(bytes,i,1));
	} catch (ex) {
		error = true;
	}
    params.curentDate = (new Date(epoch * 1000)).toISOString();
    params.statusCode = state;
    params.statusMessage = statusAxiomaShort(state);
    params.logCurrentVolume1 =  volume1;
    params.logDateCurrentVolume =  (new Date(epoch * 1000)).toISOString();;
    params.logCurrentVolume2 =  volume2;
    params.pastVolumesAndTimes = pastVolumes;//pastVolumes.map(v => v );
    params.paddingByte = padding_byte;
    params.error  = error ? error : undefined;
	return params;
}

function autoDecode(bytes, body) {
	if (body.port == 101) {
		//Configuration frame
		return {};
	}	
    return decodeAxiomaExtended(bytes);
}

/*function testDecoder(){
    var test  = [0xb3,0x63,0xc3,0x63,0x00,0x20,0x3a,0x05,0x00,0x8f,0x21];
    var obj = autoDecode(test,{});
    console.log("curentDate: " + obj.curentDate);
    console.log("statusCode: " + obj.statusCode);
    console.log("statusMessage: " + obj.statusMessage);
    console.log("logCurrentVolume1: " + obj.logCurrentVolume1);
    console.log("logDateCurrentVolume:" + obj.logDateCurrentVolume);
    console.log("logCurrentVolume2: " + obj.logCurrentVolume2);
    console.log("pastVolumesAndTimes: " + obj.pastVolumesAndTimes);    
    console.log("paddingByte: " + obj.paddingByte);
    console.log("error: " + obj.error);
    console.log("decode_data_hex: " + obj.decode_data_hex);
    console.log("bytes: " + obj.bytes);
    
    }
    testDecoder();*/