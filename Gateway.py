import urllib
import urllib2
import json
import serial
import time

judge  = True

while judge :
	time.sleep(10);

	url = "http://192.168.1.100:3000/"
	
	#open post
	open_data = {'ServiceCode':'aaaa','b':'bbbbb'}
	open_urlencode = urllib.urlencode(open_data)

	requrl_open = url + "open"

	req = urllib2.Request(url = requrl_open,data =open_urlencode)

	res_open = urllib2.urlopen(req)
	res = res_open.read()
	if res != 'false' :
		print 'open:'
		
		j = json.loads(res)

		l = len(json.dumps(res))-4

		if l<310:
			num = (l+1)/31
		elif l<(310+32*90):
			num = (l+1-310)/32+10
		elif l<(310+32*90+33*900):
			num = (l+1-310-32*90)/33+100
		else :
			num = (l+1-310-32*90-33*900)/34+1000
		
		for i in range(0,num):
				print j[str(i)]["roomnum"]
		#serial open
		ser = serial.Serial('/dev/ttyUSB0', 9600)
		print ser.isOpen()
		ser.parity = serial.PARITY_NONE
		ser.stopbits = 1
		words = '@ON'
		print "send "+words+" to cp2102"
        w = ser.write(words)
		print ser.read(10)
	#close post
	close_data = {'ServiceCode':'aaaa','b':'bbbbb'}
	close_urlencode = urllib.urlencode(close_data)

	requrl_close = url + "close"

	req = urllib2.Request(url = requrl_close,data =close_urlencode)

	res_close = urllib2.urlopen(req)
	res1 = res_close.read()
	if res1 != 'false' :
		j = json.loads(res1)

		l = len(json.dumps(res1))-4

		if l<310:
			num = (l+1)/31
		elif l<(310+32*90):
			num = (l+1-310)/32+10
		elif l<(310+32*90+33*900):
			num = (l+1-310-32*90)/33+100
		else :
			num = (l+1-310-32*90-33*900)/34+1000

		print 'close:'
		
		for i in range(0,num):
				print j[str(i)]["roomnum"]
				
		#serial close
		ser = serial.Serial('/dev/ttyUSB0', 9600)
		print ser.isOpen()
		ser.parity = serial.PARITY_NONE
		ser.stopbits = 1
		words = '@OFF'
		print "send "+words+" to cp2102"
        w = ser.write(words)
		print ser.read(10)