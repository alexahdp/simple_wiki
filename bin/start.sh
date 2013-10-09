#!/bin/bash

ADDR="127.0.0.1:8915"

#ps auxww | grep -F $ADDR | grep -v 'grep' | perl -l12ane 'print /(\d+)/' | kill `cat`

(
	morbo -w templates -w lib -v -l http://$ADDR script/wiki 2>&1 | while read F; do echo [`date`] "$F"; done
) >> log/mojo.log &
