package org.vaadin.maanpaa.data.endpoint;

import org.vaadin.maanpaa.data.entity.DrawOperation;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

@Endpoint
@AnonymousAllowed
public class DrawEndpoint {

    public void addOperation(DrawOperation operation) {
        System.out.println(operation);
    }

}
