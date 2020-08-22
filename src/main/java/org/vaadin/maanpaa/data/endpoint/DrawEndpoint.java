package org.vaadin.maanpaa.data.endpoint;

import java.util.ArrayList;
import java.util.List;

import org.vaadin.maanpaa.data.entity.DrawOperation;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

@Endpoint
@AnonymousAllowed
public class DrawEndpoint {

    private static Object lock = new Object();

    private static List<DrawOperation> ops = new ArrayList<>();

    private static String canvasData;

    public List<DrawOperation> update(List<DrawOperation> opsToAdd) {
        synchronized (lock) {
            ops.addAll(opsToAdd);
            return ops;
        }
    }

    public void saveCanvas(String canvasData) {
        this.canvasData = canvasData;
    }

    public String loadCanvas() {
        return canvasData;
    }

}
