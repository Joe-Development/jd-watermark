function SetPosition(x, y)
    SetResourceKvp('jd-watermark:position', json.encode({ x = x, y = y }))
end

function GetPosition()
    local position = GetResourceKvpString('jd-watermark:position');
    if position then
        return json.decode(position);
    end
    return nil;
end

function SetScale(width, height)
    SetResourceKvp('jd-watermark:scale', json.encode({ width = width, height = height }))
end

function GetScale()
    local scale = GetResourceKvpString('jd-watermark:scale');
    if scale then
        return json.decode(scale);
    end
    return nil;
end

function UpdateWatermark()
    local pos = GetPosition()
    local scale = GetScale()
    local image = Config.Watermark.image
    local min = Config.Defaults.min

    SendNUIMessage({
        action = 'set-watermark',
        meta = {
            position = pos,
            scale = scale,
            image = image,
            min = min,
        }
    })
end
