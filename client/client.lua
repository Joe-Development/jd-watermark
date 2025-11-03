CreateThread(function()
    Wait(200)

    TriggerEvent('chat:addSuggestion', '/watermark', 'Open the watermark editor')

    if not GetPosition() then
        SetPosition(Config.Defaults.position.x, Config.Defaults.position.y)
    end

    if not GetScale() then
        SetScale(Config.Defaults.scale.width, Config.Defaults.scale.height)
    end

    UpdateWatermark()
end)

RegisterCommand('watermark', function()
    local pos = GetPosition() or Config.Defaults.position
    local scale = GetScale() or Config.Defaults.scale
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

    Wait(200)

    SendNUIMessage({
        action = 'edit-watermark',
    })
end, false)

RegisterNUICallback('edit-mode-active', function(data, cb)
    SetNuiFocus(true, true)
    cb('ok')
end)

RegisterNUICallback('edit-mode-inactive', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('save-settings', function(data, cb)
    local position = data.position
    local scale = data.scale

    SetPosition(position.x, position.y)

    SetScale(scale.width, scale.height)

    UpdateWatermark()

    cb('ok')
end)
