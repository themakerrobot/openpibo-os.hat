def run():
  try:
    import os
    from openpibo.oled import OledbyILI9341 as Oled

    v = os.popen('/home/pi/openpibo-os/system/system.sh').read().strip('\n').split(',')
    o = Oled()
    if v[7] != "" and v[7][0:3] != "169":
      wip, ssid, sn = v[7], "", v[0][-8:]
    elif v[6] != "" and v[6][0:3] != "169":
      wip, ssid, sn = v[6], v[8], v[0][-8:]
    else:
      wip, ssid, sn = "", "", v[0][-8:]

    o.set_font(size=25)
    o.draw_text((0,50), f'# WIFI')
    o.draw_text((0,100), f'SN: {sn}')
    o.draw_text((0,150), f'I P: {wip.strip()}')
    o.draw_text((0,200), f'AP: {ssid}')
    o.show()
    ret = True, ""
  except Exception as ex:
    ret = False, str(ex)
  finally:
    return ret
    
if __name__ == "__main__":
  print(run())
